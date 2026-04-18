import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../models/message.model';
import { Reaction } from '../models/reaction.model';
import { MessageService } from '../services/message.service';
import { ReactionService } from '../services/reaction.service';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-thread.component.html',
  styleUrl: './message-thread.component.css'
})
export class MessageThreadComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
  @Input() conversationId?: number;
  @Output() messageDeleted = new EventEmitter<number>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  messages: Message[] = [];
  reactions: Map<number, Reaction[]> = new Map();
  showReactionPicker: number | null = null;
  currentUserId: number = 1;

  private pollInterval?: ReturnType<typeof setInterval>;
  private shouldScrollToBottom = true;
  private isErrorState = false;

  readonly EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];

  constructor(
    private messageService: MessageService,
    private reactionService: ReactionService,
    private currentUserService: CurrentUserService
  ) {
    this.currentUserId = this.currentUserService.getCurrentUserId();
  }

  ngOnInit(): void {
    if (this.conversationId) this.startPolling(3000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversationId'] && this.conversationId) {
      this.messages = [];
      this.reactions.clear();
      this.stopPolling();
      this.isErrorState = false;
      this.loadMessages();
      this.startPolling(3000);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private startPolling(ms: number): void {
    this.stopPolling();
    this.pollInterval = setInterval(() => this.loadMessages(), ms);
  }

  private stopPolling(): void {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadMessages(): void {
    if (!this.conversationId) return;
    this.messageService.getByConversation(this.conversationId).pipe(
      tap(() => {
        if (this.isErrorState) {
          this.isErrorState = false;
          this.startPolling(3000); // Back to normal
        }
      }),
      catchError(err => {
        console.error('Polling for messages failed, slowing down...', err);
        if (!this.isErrorState) {
          this.isErrorState = true;
          this.startPolling(30000); // Slow down on error
        }
        return of([]);
      })
    ).subscribe({
      next: (msgs: Message[]) => {
        const prevCount = this.messages.length;
        this.messages = msgs;
        this.shouldScrollToBottom = msgs.length !== prevCount;
        // Load reactions for each message
        msgs.forEach((m: Message) => {
          if (m.id && !this.reactions.has(m.id)) {
            this.loadReactions(m.id);
          }
        });
        // Mark unread messages as read
        msgs.filter((m: Message) => m.receiverId === this.currentUserId && !m.readAt && !m.deleted)
          .forEach((m: Message) => m.id && this.messageService.markAsRead(m.id).subscribe());
      }
    });
  }

  private loadReactions(messageId: number): void {
    this.reactionService.getByMessage(messageId).pipe(
      catchError(() => of([]))
    ).subscribe({
      next: (rxns: Reaction[]) => this.reactions.set(messageId, rxns)
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  isMine(msg: Message): boolean {
    return msg.senderId === this.currentUserId;
  }

  isBot(msg: Message): boolean {
    return (msg.content || '').startsWith('🤖');
  }

  getSentimentClass(sentiment?: string): string {
    if (!sentiment) return 'neutral';
    return sentiment.toLowerCase();
  }

  getSentimentEmoji(sentiment?: string): string {
    switch (sentiment) {
      case 'POSITIVE': return '🟢';
      case 'NEGATIVE': return '🔴';
      default: return '⚪';
    }
  }

  getFileIcon(fileName?: string): string {
    if (!fileName) return 'attach_file';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext!)) return 'image';
    if (['pdf'].includes(ext!)) return 'picture_as_pdf';
    if (['mp4', 'mov', 'avi'].includes(ext!)) return 'video_file';
    if (['zip', 'rar', '7z'].includes(ext!)) return 'folder_zip';
    return 'description';
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  toggleReactionPicker(msgId?: number): void {
    this.showReactionPicker = this.showReactionPicker === msgId ? null : (msgId ?? null);
  }

  addReaction(messageId: number | undefined, emoji: string): void {
    if (!messageId) return;
    this.reactionService.add(messageId, this.currentUserId, emoji).subscribe({
      next: () => {
        this.loadReactions(messageId);
        this.showReactionPicker = null;
      }
    });
  }

  removeReaction(messageId: number | undefined, emoji: string): void {
    if (!messageId) return;
    this.reactionService.remove(messageId, this.currentUserId, emoji).subscribe({
      next: () => this.loadReactions(messageId)
    });
  }

  getGroupedReactions(messageId?: number): { emoji: string; count: number; mine: boolean }[] {
    if (!messageId) return [];
    const rxns = this.reactions.get(messageId) || [];
    const grouped = new Map<string, Reaction[]>();
    rxns.forEach((r: Reaction) => {
      const list = grouped.get(r.emoji) || [];
      list.push(r);
      grouped.set(r.emoji, list);
    });
    return Array.from(grouped.entries()).map(([emoji, list]: [string, Reaction[]]) => ({
      emoji,
      count: list.length,
      mine: list.some((r: Reaction) => r.userId === this.currentUserId)
    }));
  }

  deleteMessage(id?: number): void {
    if (!id || !confirm('Supprimer ce message ?')) return;
    this.messageService.delete(id).subscribe({
      next: () => {
        this.loadMessages();
        this.messageDeleted.emit(id);
      }
    });
  }

  openMapLink(lat?: number, lng?: number): void {
    if (!lat || !lng) return;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
