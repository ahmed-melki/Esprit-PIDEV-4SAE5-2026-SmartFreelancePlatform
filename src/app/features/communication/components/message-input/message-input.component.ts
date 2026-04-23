import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { finalize } from 'rxjs/operators';
import { MessageService } from '../../services/message.service';
import { Message } from '../../models/message.model';
import { SpeechRecognitionService } from '../../../../services/speech-recognition.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TextFieldModule, MatButtonModule, MatIconModule, MatTooltipModule, MatSnackBarModule],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss']
})
export class MessageInputComponent {
  @Input() conversationId!: number;
  /** ID de l'utilisateur courant (utilisé pour partage de position). */
  @Input() senderId!: number;
  /** Émis dès validation d'un message texte (pour appel backend IA). */
  @Output() messageSubmitted = new EventEmitter<string>();
  @Output() messageSent = new EventEmitter<void>();
  @ViewChild('messageInput') messageInputEl!: ElementRef<HTMLTextAreaElement>;

  messageText = '';
  isListening = false;
  voiceHint: string | null = null;

  /** True pendant le partage de position (désactive le bouton 📍). */
  isSharingLocation = false;

  // Endpoint backend (hors proxy) pour le partage de position.
  private readonly locationShareUrl = 'http://localhost:8089/Communication/api/location/share';

  constructor(
    private messageService: MessageService,
    private speechService: SpeechRecognitionService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  private getCurrentPosition$(): Observable<GeolocationPosition> {
    return new Observable<GeolocationPosition>((observer) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        observer.error(new Error('Géolocalisation non supportée par ce navigateur.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          observer.next(pos);
          observer.complete();
        },
        (err) => observer.error(err),
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 0,
        },
      );
    });
  }

  /** Partage la position GPS et déclenche un reload côté parent via messageSent. */
  shareLocation(): void {
    // Validation minimale des inputs
    if (!this.conversationId || !this.senderId) {
      console.error('[Location] conversationId/senderId manquants', {
        conversationId: this.conversationId,
        senderId: this.senderId,
      });
      this.snackBar.open('Impossible de partager la position (contexte manquant).', 'OK', { duration: 3000 });
      return;
    }

    if (this.isSharingLocation) return;

    this.isSharingLocation = true;

    this.getCurrentPosition$()
      .pipe(
        switchMap((pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;
          const payload = {
            conversationId: this.conversationId,
            senderId: this.senderId,
            latitude,
            longitude,
          };
          return this.http.post(this.locationShareUrl, payload);
        }),
        finalize(() => {
          this.isSharingLocation = false;
        }),
      )
      .subscribe({
        next: () => {
          this.snackBar.open('📍 Position partagée', 'OK', { duration: 2500 });
          this.messageSent.emit();
        },
        error: (err: any) => {
          // Erreurs géoloc standard: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
          const code = err?.code;
          if (code === 1) {
            this.snackBar.open('Permission de localisation refusée.', 'OK', { duration: 4000 });
            return;
          }
          if (code === 2) {
            this.snackBar.open('Position indisponible. Réessayez.', 'OK', { duration: 4000 });
            return;
          }
          if (code === 3) {
            this.snackBar.open('Délai dépassé pour obtenir la position.', 'OK', { duration: 4000 });
            return;
          }

          console.error('[Location] Erreur partage position', err);
          this.snackBar.open('Erreur lors du partage de la position.', 'OK', { duration: 4000 });
        },
      });
  }

  /** Permet au parent (ex: chips de suggestions) de préremplir le texte. */
  setMessageText(text: string): void {
    this.messageText = text;
    queueMicrotask(() => this.messageInputEl?.nativeElement?.focus());
  }

  sendMessage(content: string): void {
    const trimmed = (content ?? '').trim();
    if (!trimmed) return;

    // Le texte est géré par le parent (optimistic UI + appel backend IA).
    this.messageSubmitted.emit(trimmed);
    this.messageText = '';
  }

  /** Entrée = envoyer, Shift+Entrée = nouvelle ligne. */
  handleKeydown(event: Event): void {
    const e = event as KeyboardEvent;
    // On n'intercepte que la touche Entrée. Les autres touches doivent fonctionner normalement.
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return;
    e.preventDefault();
    this.sendMessage(this.messageText);
  }

  sendAndClear(): void {
    this.sendMessage(this.messageText);
  }

  startVoiceInput(): void {
    if (this.isListening) return;

    if (!this.speechService.isSupported()) {
      this.voiceHint = 'Reconnaissance vocale non supportée par ce navigateur.';
      setTimeout(() => (this.voiceHint = null), 2500);
      return;
    }

    this.isListening = true;
    this.voiceHint = 'Parlez maintenant…';

    let gotTranscript = false;
    let timeoutId: any;
    let sub: Subscription | null = null;

    // Timeout de silence : évite de rester bloqué si l'API ne capte aucun son.
    timeoutId = setTimeout(() => {
      if (!this.isListening || gotTranscript) return;
      this.voiceHint = 'Je ne détecte pas de voix…';
      sub?.unsubscribe();
    }, 5000);

    sub = this.speechService
      // Debug activé pour diagnostiquer les cas "no-speech" (voir console).
      .listen({ debug: true })
      .pipe(
        finalize(() => {
          this.isListening = false;
          if (timeoutId) clearTimeout(timeoutId);

          // Si l'écoute s'arrête sans résultat et sans erreur explicite.
          if (!gotTranscript && this.voiceHint === 'Parlez maintenant…') {
            this.voiceHint = 'Aucune voix détectée.';
            setTimeout(() => (this.voiceHint = null), 2000);
          }
        }),
      )
      .subscribe({
        next: (text) => {
          const t = (text ?? '').trim();
          if (!t) return;
          gotTranscript = true;
          this.voiceHint = null;
          this.messageText = this.messageText?.trim() ? `${this.messageText.trim()} ${t}` : t;
          queueMicrotask(() => this.messageInputEl?.nativeElement?.focus());
        },
        error: (err: any) => {
          const raw = err?.raw;
          const code = String(raw?.error ?? err?.message ?? '');

          if (code.includes('no-speech')) {
            this.voiceHint = "Je n'ai rien entendu. Parlez plus près du micro.";
            setTimeout(() => (this.voiceHint = null), 3500);
            return;
          }

          if (code.includes('not-allowed') || code.includes('service-not-allowed')) {
            this.voiceHint = 'Autorisation micro refusée.';
            setTimeout(() => (this.voiceHint = null), 3000);
            return;
          }

          console.error('Speech recognition error', err);
          this.voiceHint = 'Erreur de reconnaissance vocale.';
          setTimeout(() => (this.voiceHint = null), 2500);
        },
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', this.conversationId.toString());
    formData.append('senderId', '1');
    formData.append('receiverId', '2');
    formData.append('content', '📎 Fichier joint');
    this.messageService.uploadFile(formData).subscribe({
      next: () => {
        this.messageSent.emit();
        input.value = '';
      },
      error: (err) => console.error('Erreur upload fichier', err)
    });
  }
}