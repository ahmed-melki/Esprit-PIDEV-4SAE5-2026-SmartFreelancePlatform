import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../models/conversation.model';
import { ConversationService } from '../services/conversation.service';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.css'
})
export class ConversationListComponent implements OnInit, OnDestroy {
  @Input() selectedConversationId?: number;
  @Output() conversationSelected = new EventEmitter<Conversation>();
  @Output() newConversation = new EventEmitter<void>();

  conversations: Conversation[] = [];
  showCreateForm = false;
  searchTerm = '';
  currentUserId: number = 1;

  private pollInterval?: ReturnType<typeof setInterval>;
  private isErrorState = false;

  constructor(
    private conversationService: ConversationService,
    private currentUserService: CurrentUserService
  ) {
    this.currentUserId = this.currentUserService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.loadConversations();
    this.startPolling(3000);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(ms: number): void {
    this.stopPolling();
    this.pollInterval = setInterval(() => this.loadConversations(), ms);
  }

  private stopPolling(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadConversations(): void {
    this.conversationService.getAll().pipe(
      tap(() => {
        if (this.isErrorState) {
          this.isErrorState = false;
          this.startPolling(3000); // Back to normal
        }
      }),
      catchError(err => {
        console.error('Failed to load conversations, slowing down...', err);
        if (!this.isErrorState) {
          this.isErrorState = true;
          this.startPolling(30000); // Slow down on error
        }
        return of([]);
      })
    ).subscribe({
      next: (convs: Conversation[]) => this.conversations = convs
    });
  }

  get filteredConversations(): Conversation[] {
    if (!this.searchTerm) return this.conversations;
    const term = this.searchTerm.toLowerCase();
    return this.conversations.filter(c =>
      c.lastMessageContent?.toLowerCase().includes(term) ||
      c.id?.toString().includes(term)
    );
  }

  selectConversation(conv: Conversation): void {
    this.conversationSelected.emit(conv);
  }

  createConversation(): void {
    // Hardcoded IDs as per requirements
    const hardcodedConv: any = { clientId: 1, freelanceId: 2, projectId: 1 };
    this.conversationService.create(hardcodedConv).subscribe({
      next: (conv: Conversation) => {
        this.conversations.unshift(conv);
        this.showCreateForm = false;
        this.selectConversation(conv);
      },
      error: (err: any) => console.error('Error creating conversation:', err)
    });
  }

  deleteConversation(conv: Conversation, event: Event): void {
    event.stopPropagation();
    if (!conv.id || !confirm('Supprimer cette conversation ?')) return;
    this.conversationService.delete(conv.id).subscribe({
      next: () => this.conversations = this.conversations.filter((c: Conversation) => c.id !== conv.id),
      error: (err: any) => console.error('Error deleting conversation:', err)
    });
  }

  getConvLabel(conv: Conversation): string {
    return `Conversation #${conv.id}`;
  }

  getTimeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `${diffMins}min`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    return `${Math.floor(diffHrs / 24)}j`;
  }
}
