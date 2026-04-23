import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject, timer, of } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

import { Conversation } from '../models/conversation.model';
import { ConversationListComponent } from '../conversation-list/conversation-list.component';
import { MessageThreadComponent } from '../message-thread/message-thread.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ConversationService } from '../services/conversation.service';
import { CurrentUserService } from '../../../core/services/current-user.service';

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
  currentUserId = 1;
  selectedConversation?: Conversation;
  showThemeMenu = false;
  sidebarOpen = true;

  // Presence
  partnerOnline = false;
  partnerLastSeen = '';

  // Thread reload trigger
  threadReloadNonce = 0;

  private destroy$ = new Subject<void>();
  private stopPresence$ = new Subject<void>();

  readonly THEMES = [
    { key: 'default', label: 'Default', color: '#4338ca' },
    { key: 'ocean', label: 'Ocean', color: '#0ea5e9' },
    { key: 'forest', label: 'Forest', color: '#10b981' },
    { key: 'sunset', label: 'Sunset', color: '#f59e0b' },
    { key: 'rose', label: 'Rose', color: '#f43f5e' },
    { key: 'midnight', label: 'Midnight', color: '#1e293b' },
  ];

  constructor(
    private http: HttpClient,
    private conversationService: ConversationService,
    private currentUserService: CurrentUserService
  ) {
    this.currentUserId = this.currentUserService.getCurrentUserId();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopPresence$.next();
    this.stopPresence$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onConversationSelected(conv: Conversation): void {
    this.selectedConversation = conv;
    this.showThemeMenu = false;

    this.threadReloadNonce++;
    this.startPresencePolling();
  }

  get partnerId(): number {
    if (!this.selectedConversation) return 0;
    return this.selectedConversation.clientId === this.currentUserId
      ? this.selectedConversation.freelanceId
      : this.selectedConversation.clientId;
  }

  get conversationTitle(): string {
    if (!this.selectedConversation) return '';
    return this.selectedConversation.title || `Conversation #${this.selectedConversation.id}`;
  }

  private coerceBoolean(value: unknown): boolean {
    if (value === true) return true;
    if (value === false) return false;
    if (value == null) return false;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true' || v === '1' || v === 'yes' || v === 'y') return true;
      if (v === 'false' || v === '0' || v === 'no' || v === 'n' || v === '') return false;
    }
    return Boolean(value);
  }

  private normalizeOptionalString(value: unknown): string {
    if (value == null) return '';
    const s = String(value).trim();
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return '';
    return s;
  }

  private startPresencePolling(): void {
    this.stopPresence$.next();
    this.partnerOnline = false;
    this.partnerLastSeen = '';

    const userId = this.partnerId;
    if (!userId) return;

    timer(0, 30000).pipe(
      takeUntil(this.stopPresence$),
      takeUntil(this.destroy$),
      switchMap(() => this.http.get<Record<string, unknown>>(`/api/presence/${userId}`).pipe(
        catchError(() => of({ online: false }))
      ))
    ).subscribe((p) => {
      this.partnerOnline = this.coerceBoolean(p?.online);
      this.partnerLastSeen = this.normalizeOptionalString((p as any)?.lastSeen ?? (p as any)?.last_seen);
    });
  }

  getThemeColor(): string {
    const theme = this.selectedConversation?.theme || 'default';
    return this.THEMES.find(t => t.key === theme)?.color || '#4338ca';
  }

  setTheme(theme: string): void {
    if (!this.selectedConversation?.id) return;
    this.conversationService.updateTheme(this.selectedConversation.id, theme).subscribe({
      next: (updated) => {
        if (this.selectedConversation) this.selectedConversation.theme = updated.theme;
        this.showThemeMenu = false;
      }
    });
  }

  onMessageSent(): void {
    this.threadReloadNonce++;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
