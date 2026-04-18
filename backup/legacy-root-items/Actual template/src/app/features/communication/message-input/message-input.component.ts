import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../models/message.model';
import { MessageService } from '../services/message.service';
import { CurrentUserService } from '../../../core/services/current-user.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.css'
})
export class MessageInputComponent {
  @Input() conversationId!: number;
  @Output() messageSent = new EventEmitter<Message>();

  senderId = 1;
  receiverId = 2;

  content = '';
  showEmojiPicker = false;
  isUploading = false;
  locationLoading = false;

  readonly EMOJIS = ['😀','😂','😍','🤔','👍','❤️','🔥','🎉','😎','🙏','✅','💡','🚀','💬','📎','📍'];

  constructor(
    private messageService: MessageService,
    private currentUserService: CurrentUserService
  ) {
    this.senderId = this.currentUserService.getCurrentUserId();
  }

  send(): void {
    if (!this.content.trim() || !this.conversationId) return;
    const msg: Message = {
      conversationId: this.conversationId,
      senderId: this.senderId,
      receiverId: this.receiverId,
      content: this.content.trim(),
      status: 'SENT'
    };
    this.messageService.send(msg).subscribe({
      next: saved => {
        this.messageSent.emit(saved);
        this.content = '';
      },
      error: err => console.error('Send error:', err)
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  appendEmoji(emoji: string): void {
    this.content += emoji;
    this.showEmojiPicker = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', this.conversationId.toString());
    formData.append('senderId', this.senderId.toString());
    formData.append('receiverId', this.receiverId.toString());

    this.isUploading = true;
    this.messageService.uploadFile(formData).subscribe({
      next: saved => {
        this.messageSent.emit(saved);
        this.isUploading = false;
        input.value = '';
      },
      error: err => {
        console.error('Upload error:', err);
        this.isUploading = false;
      }
    });
  }

  shareLocation(): void {
    if (!navigator.geolocation) {
      alert('Géolocalisation non supportée par votre navigateur.');
      return;
    }
    this.locationLoading = true;
    navigator.geolocation.getCurrentPosition(
      pos => {
        const locationMsg: Message = {
          conversationId: this.conversationId,
          senderId: this.senderId,
          receiverId: this.receiverId,
          content: '📍 Position partagée',
          locationLat: pos.coords.latitude,
          locationLng: pos.coords.longitude,
          isLocation: true,
          status: 'SENT'
        };
        this.messageService.send(locationMsg).subscribe({
          next: saved => {
            this.messageSent.emit(saved);
            this.locationLoading = false;
          },
          error: err => {
            console.error('Location share error:', err);
            this.locationLoading = false;
          }
        });
      },
      err => {
        alert('Impossible d\'accéder à votre localisation.');
        this.locationLoading = false;
      }
    );
  }
}
