import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatAiService } from '../services/chat-ai.service';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent {
  messages: ChatMessage[] = [
    {
      role: 'ai',
      content: '👋 Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ];
  input = '';
  isLoading = false;
  isOpen = false;

  constructor(private chatAiService: ChatAiService) {}

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  send(): void {
    const text = this.input.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.input = '';
    this.isLoading = true;

    this.chatAiService.ask(text).subscribe({
      next: res => {
        this.messages.push({ role: 'ai', content: res.response, timestamp: new Date() });
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({ role: 'ai', content: '❌ Erreur de connexion. Veuillez réessayer.', timestamp: new Date() });
        this.isLoading = false;
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  clearConversation(): void {
    this.messages = [this.messages[0]];
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
