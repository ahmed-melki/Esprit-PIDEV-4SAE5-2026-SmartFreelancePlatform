import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../models/conversation.model';
import { ConversationService } from '../services/conversation.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.css'
})
export class ConversationListComponent implements OnInit {
  @Input() selectedConversationId?: number;
  @Output() conversationSelected = new EventEmitter<Conversation>();

  conversations: Conversation[] = [];
  searchTerm = '';

  // Modal state
  showNewModal = false;
  newConvTitle = '';
  creating = false;

  constructor(private conversationService: ConversationService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.conversationService.getAll().subscribe({
      next: (convs) => this.conversations = convs,
      error: (err) => console.error('Failed to load conversations', err)
    });
  }

  get filteredConversations(): Conversation[] {
    if (!this.searchTerm) return this.conversations;
    const term = this.searchTerm.toLowerCase();
    return this.conversations.filter(c =>
      c.title?.toLowerCase().includes(term) ||
      c.id?.toString().includes(term) ||
      c.lastMessageContent?.toLowerCase().includes(term)
    );
  }

  selectConversation(conv: Conversation): void {
    this.conversationSelected.emit(conv);
  }

  openNewModal(): void {
    this.newConvTitle = '';
    this.showNewModal = true;
  }

  closeNewModal(): void {
    this.showNewModal = false;
    this.newConvTitle = '';
  }

  confirmCreate(): void {
    if (!this.newConvTitle.trim() || this.creating) return;
    this.creating = true;

    const payload: Conversation = {
      title: this.newConvTitle.trim(),
      clientId: 1,
      freelanceId: 1,
      projectId: 1,
      status: 'ACTIVE',
      theme: 'default'
    };

    this.conversationService.create(payload).subscribe({
      next: (conv) => {
        this.conversations.unshift(conv);
        this.selectConversation(conv);
        this.closeNewModal();
        this.creating = false;
      },
      error: (err) => {
        console.error('Error creating conversation:', err);
        this.creating = false;
      }
    });
  }

  deleteConversation(conv: Conversation, event: Event): void {
    event.stopPropagation();
    if (!conv.id || !confirm('Supprimer cette conversation ?')) return;
    this.conversationService.delete(conv.id).subscribe({
      next: () => this.conversations = this.conversations.filter(c => c.id !== conv.id),
      error: (err) => console.error('Error deleting conversation:', err)
    });
  }

  getTimeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diffMins < 1) return 'à l\'instant';
      if (diffMins < 60) return `${diffMins}min`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h`;
      return `${Math.floor(diffHrs / 24)}j`;
    } catch { return ''; }
  }
}
