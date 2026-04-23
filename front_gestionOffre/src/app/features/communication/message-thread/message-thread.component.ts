import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../models/message.model';
import { MessageService } from '../services/message.service';
import { CurrentUserService } from '../../../core/services/current-user.service';

@Component({
  selector: 'app-message-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-thread.component.html',
  styleUrl: './message-thread.component.css'
})
export class MessageThreadComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() conversationId?: number;
  @Input() set reloadTrigger(_val: any) {
    if (this.conversationId) this.loadMessages(true);
  }
  @Output() messageDeleted = new EventEmitter<number>();

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  messages: Message[] = [];
  currentUserId = 1;

  // Edit state
  editingMessageId?: number;
  editContent = '';
  savingEdit = false;

  analyzingIds = new Set<number>();

  private shouldScrollToBottom = true;
  private nearBottom = true;
  private readonly NEAR_BOTTOM_PX = 80;

  constructor(
    private messageService: MessageService,
    private currentUserService: CurrentUserService
  ) {
    this.currentUserId = this.currentUserService.getCurrentUserId();
  }

  ngOnInit(): void {
    if (this.conversationId) this.loadMessages(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversationId'] && this.conversationId) {
      this.messages = [];
      this.editingMessageId = undefined;
      this.loadMessages(true);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) this.scrollToBottom();
  }

  onScroll(): void {
    this.nearBottom = this.isNearBottom();
  }

  loadMessages(forceScroll = false): void {
    if (!this.conversationId) return;

    const prevCount = this.messages.length;
    const shouldAutoScroll = forceScroll || this.nearBottom || prevCount === 0;

    this.messageService.getByConversation(this.conversationId).subscribe({
      next: (msgs: Message[]) => {
        // Hide soft-deleted messages
        const visible = (msgs || []).filter(m => !m.deleted);
        this.messages = visible;

        const newCount = visible.length;
        this.shouldScrollToBottom = forceScroll || (shouldAutoScroll && newCount >= prevCount);
      },
      error: (err) => console.error('Failed to load messages', err)
    });
  }

  private isNearBottom(): boolean {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (!el) return true;
      const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
      return distance <= this.NEAR_BOTTOM_PX;
    } catch {
      return true;
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
      this.nearBottom = true;
      this.shouldScrollToBottom = false;
    } catch {
      this.shouldScrollToBottom = false;
    }
  }

  isMine(msg: Message): boolean {
    return msg.senderId === this.currentUserId;
  }

  isEditing(msg: Message): boolean {
    return !!msg.id && this.editingMessageId === msg.id;
  }

  startEdit(msg: Message, event?: Event): void {
    event?.stopPropagation();
    if (!msg.id || !this.isMine(msg) || msg.deleted) return;
    this.editingMessageId = msg.id;
    this.editContent = msg.content;
  }

  cancelEdit(event?: Event): void {
    event?.stopPropagation();
    this.editingMessageId = undefined;
    this.editContent = '';
    this.savingEdit = false;
  }

  saveEdit(msg: Message, event?: Event): void {
    event?.stopPropagation();
    if (!msg.id || !this.isMine(msg) || msg.deleted || this.savingEdit) return;

    const next = this.editContent.trim();
    if (!next) return;

    const prev = msg.content;
    this.savingEdit = true;

    // Optimistic UI update
    msg.content = next;

    this.messageService.update(msg.id, next).subscribe({
      next: (updated) => {
        msg.content = updated?.content ?? next;
        msg.sentiment = updated?.sentiment ?? msg.sentiment;
        msg.fileUrl = updated?.fileUrl ?? msg.fileUrl;
        msg.fileName = updated?.fileName ?? msg.fileName;
        msg.fileSize = updated?.fileSize ?? msg.fileSize;
        this.editingMessageId = undefined;
        this.editContent = '';
        this.savingEdit = false;
      },
      error: (err) => {
        console.error('Edit error:', err);
        msg.content = prev;
        this.savingEdit = false;
      }
    });
  }

  onEditKeydown(event: KeyboardEvent, msg: Message): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveEdit(msg, event);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit(event);
    }
  }

  deleteMessage(msg: Message, event?: Event): void {
    event?.stopPropagation();
    if (!msg.id || msg.deleted) return;

    const idx = this.messages.findIndex(m => m.id === msg.id);
    if (idx < 0) return;

    const removed = this.messages[idx];
    // Disappear immediately
    this.messages = this.messages.filter(m => m.id !== msg.id);

    this.messageService.delete(msg.id).subscribe({
      next: () => this.messageDeleted.emit(msg.id!),
      error: (err) => {
        console.error('Delete error:', err);
        // Restore message if delete fails
        const copy = [...this.messages];
        copy.splice(idx, 0, removed);
        this.messages = copy;
      }
    });
  }

  analyzeSentiment(msg: Message, event?: Event): void {
    event?.stopPropagation();
    if (!msg.id || msg.deleted || this.analyzingIds.has(msg.id)) return;

    this.analyzingIds.add(msg.id);

    this.messageService.analyzeSentiment(msg.id).subscribe({
      next: (res) => {
        const sentiment = this.extractSentiment(res);
        if (sentiment) msg.sentiment = sentiment;
      },
      error: (err) => console.error('Sentiment error:', err),
      complete: () => this.analyzingIds.delete(msg.id!)
    });
  }

  private extractSentiment(res: unknown): string {
    if (typeof res === 'string') return res;
    if (!res || typeof res !== 'object') return '';

    const any = res as any;
    const s = any.sentiment ?? any?.data?.sentiment;
    return typeof s === 'string' ? s : '';
  }

  sentimentKey(msg: Message): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | '' {
    const raw = (msg.sentiment || '').trim().toUpperCase();
    if (raw === 'POSITIVE' || raw === 'NEUTRAL' || raw === 'NEGATIVE') return raw;
    return '';
  }

  sentimentClass(msg: Message): string {
    const key = this.sentimentKey(msg);
    if (key === 'POSITIVE') return 'sentiment-positive';
    if (key === 'NEGATIVE') return 'sentiment-negative';
    if (key === 'NEUTRAL') return 'sentiment-neutral';
    return '';
  }

  sentimentEmoji(msg: Message): string {
    const key = this.sentimentKey(msg);
    if (key === 'POSITIVE') return '😊';
    if (key === 'NEGATIVE') return '😠';
    if (key === 'NEUTRAL') return '😐';
    return '';
  }

  formatBytes(bytes?: number): string {
    if (bytes == null || !Number.isFinite(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
