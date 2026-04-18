import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../models/conversation.model';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { MessageThreadComponent } from '../message-thread/message-thread.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ConversationService } from '../services/conversation.service';
import { PresenceService } from '../services/presence.service';
import { MessageService } from '../services/message.service';
import { Presence } from '../models/presence.model';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ConversationListComponent,
    MessageThreadComponent,
    MessageInputComponent
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  currentUserId: number = 1;
  selectedConversation?: Conversation;
  partnerPresence?: Presence;
  sentimentStats?: { positive: number; neutral: number; negative: number };
  showThemeMenu = false;
  sidebarOpen = true;

  readonly THEMES = [
    { key: 'default', label: 'Default', color: '#4338ca' },
    { key: 'ocean', label: 'Ocean', color: '#0ea5e9' },
    { key: 'forest', label: 'Forest', color: '#10b981' },
    { key: 'sunset', label: 'Sunset', color: '#f59e0b' },
    { key: 'rose', label: 'Rose', color: '#f43f5e' },
    { key: 'midnight', label: 'Midnight', color: '#1e293b' },
  ];

  private presenceInterval?: ReturnType<typeof setInterval>;
  private isPresenceError = false;

  constructor(
    private conversationService: ConversationService,
    private presenceService: PresenceService,
    private messageService: MessageService,
    private currentUserService: CurrentUserService
  ) {
    this.currentUserId = this.currentUserService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.presenceService.startHeartbeat(this.currentUserId);
  }

  ngOnDestroy(): void {
    this.presenceService.stopHeartbeat();
    this.stopPresencePolling();
  }

  private stopPresencePolling(): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = undefined;
    }
  }

  private startPresencePolling(ms: number, partnerId: number): void {
    this.stopPresencePolling();
    this.presenceInterval = setInterval(() => this.loadPartnerPresenceData(partnerId), ms);
  }

  private loadPartnerPresenceData(partnerId: number): void {
    this.presenceService.getPresence(partnerId).pipe(
      catchError(err => {
        console.warn('Presence check failed, slowing down...');
        if (!this.isPresenceError) {
          this.isPresenceError = true;
          this.startPresencePolling(30000, partnerId);
        }
        return of({ online: false } as Presence);
      })
    ).subscribe({
      next: p => {
        this.partnerPresence = p;
        if (this.isPresenceError && p.online) {
          this.isPresenceError = false;
          this.startPresencePolling(15000, partnerId);
        }
      }
    });
  }

  onConversationSelected(conv: Conversation): void {
    this.selectedConversation = conv;
    this.showThemeMenu = false;
    const partnerId = conv.clientId === this.currentUserId ? conv.freelanceId : conv.clientId;
    this.loadPartnerPresenceData(partnerId);
    this.startPresencePolling(15000, partnerId);
    this.loadSentimentStats(conv);
  }

  private loadSentimentStats(conv: Conversation): void {
    if (!conv.id) return;
    this.messageService.getSentimentStats(conv.id).pipe(
      catchError(() => of({ positive: 0, neutral: 0, negative: 0 }))
    ).subscribe({
      next: stats => this.sentimentStats = stats
    });
  }

  get partnerId(): number {
    if (!this.selectedConversation) return 0;
    return this.selectedConversation.clientId === this.currentUserId
      ? this.selectedConversation.freelanceId
      : this.selectedConversation.clientId;
  }

  getThemeColor(): string {
    const theme = this.selectedConversation?.theme || 'default';
    return this.THEMES.find(t => t.key === theme)?.color || '#4338ca';
  }

  setTheme(theme: string): void {
    if (!this.selectedConversation?.id) return;
    this.conversationService.updateTheme(this.selectedConversation.id, theme).subscribe({
      next: updated => {
        if (this.selectedConversation) this.selectedConversation.theme = updated.theme;
        this.showThemeMenu = false;
      }
    });
  }

  onMessageSent(): void {
    if (this.selectedConversation?.id) {
      this.loadSentimentStats(this.selectedConversation);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  formatPresence(presence?: Presence): string {
    if (!presence) return 'Inconnu';
    if (presence.online) return 'En ligne';
    if (!presence.lastSeen) return 'Hors ligne';
    const diff = Date.now() - new Date(presence.lastSeen).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vu à l\'instant';
    if (mins < 60) return `Vu il y a ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Vu il y a ${hrs}h`;
    return `Vu il y a ${Math.floor(hrs / 24)}j`;
  }
}
