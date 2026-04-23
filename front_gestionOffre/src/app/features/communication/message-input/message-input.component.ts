import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../models/message.model';
import { MessageService } from '../services/message.service';
import { ChatAiService } from '../services/chat-ai.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css'
})
export class MessageInputComponent {
  @Input() conversationId!: number;
  @Input() receiverId?: number;
  @Output() messageSent = new EventEmitter<Message>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  senderId = 1;
  content = '';

  selectedFile?: File;
  sending = false;
  uploading = false;
  aiMode = false;
  aiBusy = false;

  constructor(
    private messageService: MessageService,
    private chatAiService: ChatAiService
  ) {
    this.senderId = 1; // hardcoded, no auth needed
  }

  toggleAiMode(): void {
    this.aiMode = !this.aiMode;
  }

  openFilePicker(): void {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile = file ?? undefined;
  }

  clearSelectedFile(): void {
    this.selectedFile = undefined;
    const el = this.fileInput?.nativeElement;
    if (el) el.value = '';
  }

  private resolveReceiverId(): number {
    const id = this.receiverId ?? 0;
    if (id && id !== this.senderId) return id;
    return 2;
  }

  send(): void {
    const text = this.content.trim();
    if ((!text && !this.selectedFile) || !this.conversationId || this.sending) return;

    const receiver = this.resolveReceiverId();
    const contentToSend = text || (this.selectedFile ? `📎 ${this.selectedFile.name}` : '');

    const msg: Message = {
      conversationId: this.conversationId,
      senderId: this.senderId,
      receiverId: receiver,
      content: contentToSend,
      status: 'SENT'
    };

    this.sending = true;

    this.messageService.send(msg).subscribe({
      next: (saved) => {
        this.messageSent.emit(saved);
        this.content = '';

        const sentTextForAi = text;

        if (this.selectedFile && saved?.id) {
          const file = this.selectedFile;
          this.uploading = true;
          this.clearSelectedFile();

          this.messageService.uploadAttachment(saved.id, file).subscribe({
            next: (updated) => this.messageSent.emit(updated),
            error: (err) => console.error('Upload error:', err),
            complete: () => this.uploading = false
          });
        }

        if (this.aiMode && sentTextForAi) {
          this.aiBusy = true;
          this.chatAiService.ask(sentTextForAi).subscribe({
            next: ({ response }) => {
              const botMsg: Message = {
                conversationId: this.conversationId,
                senderId: receiver,
                receiverId: this.senderId,
                content: response,
                status: 'SENT'
              };
              this.messageService.send(botMsg).subscribe({
                next: (botSaved) => this.messageSent.emit(botSaved),
                error: (err) => console.error('Bot send error:', err),
                complete: () => this.aiBusy = false
              });
            },
            error: (err) => {
              console.error('AI error:', err);
              this.aiBusy = false;
            }
          });
        }

        this.sending = false;
      },
      error: (err) => {
        console.error('Send error:', err);
        this.sending = false;
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}
