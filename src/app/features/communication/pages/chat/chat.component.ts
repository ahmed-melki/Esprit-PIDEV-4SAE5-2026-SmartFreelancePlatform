import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from '../../services/message.service';
import { ConversationService } from '../../services/conversation.service';
import { Message } from '../../models/message.model';
import { Reaction, ReactionGroup } from '../../models/reaction.model';
import { MessageInputComponent } from '../../components/message-input/message-input.component';
import { SentimentStatsComponent } from '../../components/sentiment-stats/sentiment-stats.component';
import { PresenceService } from '@core';
import { ChatService } from '../../services/chat.service';

interface Suggestion {
  messageId: number;
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatMenuModule,
    MatChipsModule,
    MatSnackBarModule,
    MessageInputComponent,
    SentimentStatsComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLElement>;
  @ViewChild(MessageInputComponent) messageInputRef?: MessageInputComponent;

  conversationId!: number;
  messages: Message[] = [];
  otherParticipantName = 'Conversation';
  otherParticipantId: number = 0;
  otherParticipantOnline = false;
  /** Message dont le menu d'actions est ouvert. */
  selectedMessageForMenu: Message | null = null;

  suggestions = ['Quel est le prix ?', 'Bonjour', 'Quels sont les délais ?'];
  showSuggestions = true;

  /** Mode normal (false) = backend métier (/messages + analyses). Mode IA (true) = /api/chat. */
  useAiMode = false;

  /** Compteur d'échecs IA (remis à zéro après un succès). */
  iaErrorCount = 0;
  private readonly iaErrorThreshold = 2;

  /** messageId -> réactions groupées (emoji + count). */
  reactionsMap = new Map<number, ReactionGroup[]>();
  /** messageId -> emojis réactionnés par l'utilisateur courant. */
  userReactionsMap = new Map<number, Set<string>>();
  /** messageId -> sentiment (POSITIVE | NEUTRAL | NEGATIVE). */
  sentimentMap = new Map<number, string>();

  sentimentStats = { positive: 0, neutral: 0, negative: 0 };
  /** Suggestions FAQ (réponses proposées) - réactif via BehaviorSubject. */
  private suggestionsSubject = new BehaviorSubject<Suggestion[]>([]);
  suggestions$ = this.suggestionsSubject.asObservable();
  private suggestionsByMessageId = new Map<number, string>();
  currentUserId = 1;

  private presencePollIntervalId: ReturnType<typeof setInterval> | undefined;
  private presencePollingUserId: number | null = null;

  private readonly presenceService = inject(PresenceService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private destroyed = false;

  // Debug local (activer temporairement pour vérifier readAt/presence dans la console)
  private readonly debugLogs = false;

  private seenUrgentMessageIds = new Set<number>();
  private urgentInitDone = false;

  /** Thème d'affichage du chat (synchronisé avec la conversation). */
  currentTheme = 'default';

  themes = [
    { value: 'default', name: 'Défaut', color: '#e3f2fd' },
    { value: 'dark', name: 'Sombre', color: '#424242' },
    { value: 'blue', name: 'Bleu', color: '#2196f3' },
    { value: 'green', name: 'Vert', color: '#4caf50' },
    { value: 'purple', name: 'Violet', color: '#9c27b0' },
    { value: 'orange', name: 'Orange', color: '#ff9800' },
    { value: 'red', name: 'Rouge', color: '#f44336' },
    { value: 'teal', name: 'Sarcelle', color: '#009688' },
    { value: 'pink', name: 'Rose', color: '#e91e63' },
    { value: 'amber', name: 'Ambre', color: '#ffc107' },
    { value: 'cyan', name: 'Cyan', color: '#00bcd4' },
    { value: 'lime', name: 'Citron vert', color: '#cddc39' }
  ];

  /** true = mes messages (droite, bleu). Gère senderId en number ou string (backend). */
  isMyMessage(msg: Message): boolean {
    return Number(msg.senderId) === this.currentUserId;
  }

  isSentByCurrentUser(senderId: Message['senderId']): boolean {
    return Number(senderId) === this.currentUserId;
  }

  getReadReceiptIcon(msg: Message): 'done_all' | 'check' {
    return msg.readAt ? 'done_all' : 'check';
  }

  debugLogReadReceipt(msg: Message): void {
    if (!this.debugLogs) return;
    console.log('[Chat] read-receipt', {
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      readAt: msg.readAt,
      sentByMe: this.isSentByCurrentUser(msg.senderId),
      icon: this.getReadReceiptIcon(msg),
      readAtTruthy: Boolean(msg.readAt),
    });
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private chatService: ChatService,
    private snackBar: MatSnackBar
  ) {}

  private getAiModeStorageKey(conversationId: number): string {
    return `useAiMode_${conversationId}`;
  }

  private readStoredBoolean(key: string): boolean | undefined {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return undefined;
      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed === 'boolean') return parsed;
      if (typeof parsed === 'string') {
        const v = parsed.trim().toLowerCase();
        if (v === 'true') return true;
        if (v === 'false') return false;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  private persistAiModePreference(): void {
    try {
      if (Number.isFinite(this.conversationId)) {
        localStorage.setItem(this.getAiModeStorageKey(this.conversationId), JSON.stringify(this.useAiMode));
      } else {
        localStorage.setItem('useAiMode', JSON.stringify(this.useAiMode));
      }
    } catch {
      // ignore (private mode / blocked storage)
    }
  }

  private loadAiModePreferenceForConversation(conversationId: number): void {
    // 1) préférence par conversation
    const perConversation = this.readStoredBoolean(this.getAiModeStorageKey(conversationId));
    if (typeof perConversation === 'boolean') {
      this.useAiMode = perConversation;
      return;
    }

    // 2) fallback global (ancienne clé)
    const global = this.readStoredBoolean('useAiMode');
    if (typeof global === 'boolean') {
      this.useAiMode = global;
    }
  }

  private setAiMode(nextValue: boolean, opts?: { persist?: boolean; snack?: boolean; snackMessage?: string }): void {
    const persist = opts?.persist ?? true;
    const snack = opts?.snack ?? false;
    this.useAiMode = nextValue;
    if (persist) this.persistAiModePreference();
    if (snack) {
      this.snackBar.open(opts?.snackMessage ?? (this.useAiMode ? 'Mode IA activé' : 'Mode normal activé'), 'OK', {
        duration: 2000,
      });
    }
  }

  onMessageSubmitted(content: string): void {
    const text = (content ?? '').trim();
    if (!text) return;

    if (this.useAiMode) {
      this.sendAiMessage(text);
    } else {
      this.sendNormalMessage(text);
    }
  }

  toggleAiMode(): void {
    this.setAiMode(!this.useAiMode, { snack: true });
  }

  private sendNormalMessage(text: string): void {
    const nowIso = new Date().toISOString();
    const receiverId = Number(this.otherParticipantId) || 2;

    // Affiche immédiatement
    const optimistic: Message = {
      conversationId: this.conversationId,
      senderId: this.currentUserId,
      receiverId,
      content: text,
      status: 'SENT',
      createdAt: nowIso,
    };
    this.messages = [...this.messages, optimistic];
    this.showSuggestions = false;
    this.scrollToBottom();

    // Envoi au backend métier (déclenche analyses: sentiment, urgence, etc. selon ton backend)
    this.messageService.send({
      conversationId: this.conversationId,
      senderId: this.currentUserId,
      receiverId,
      content: text,
      status: 'SENT',
    }).subscribe({
      next: () => {
        this.loadMessages();
        this.loadSentimentStats();
      },
      error: (err) => {
        console.error('[Chat] Erreur envoi message (mode normal)', err);
        this.snackBar.open('Erreur: envoi du message impossible.', 'OK', { duration: 5000 });
      },
    });
  }

  private sendAiMessage(text: string): void {
    const nowIso = new Date().toISOString();
    const botId = Number(this.otherParticipantId) || 2;

    // Message utilisateur (affichage immédiat)
    const userMsg: Message = {
      conversationId: this.conversationId,
      senderId: this.currentUserId,
      receiverId: botId,
      content: text,
      status: 'SENT',
      createdAt: nowIso,
    };
    this.messages = [...this.messages, userMsg];
    this.showSuggestions = false;
    this.scrollToBottom();

    // Appel backend IA + affichage réponse
    this.chatService.sendMessage(text).subscribe({
      next: (reply) => {
        this.iaErrorCount = 0;
        const answer = (reply ?? '').trim();
        if (!answer) return;

        const botMsg: Message = {
          conversationId: this.conversationId,
          senderId: botId,
          receiverId: this.currentUserId,
          content: answer,
          status: 'SENT',
          createdAt: new Date().toISOString(),
        };

        this.messages = [...this.messages, botMsg];
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('[Chat] Erreur backend chatbot', err);
        this.iaErrorCount += 1;

        if (this.iaErrorCount >= this.iaErrorThreshold) {
          // Bascule auto en mode normal pour que l'app reste utilisable.
          this.iaErrorCount = 0;
          this.setAiMode(false, {
            snack: true,
            snackMessage: 'Mode IA indisponible. Retour au mode normal.',
          });
        } else {
          this.snackBar.open('Erreur: appel chatbot impossible (backend indisponible).', 'OK', { duration: 5000 });
        }

        const botMsg: Message = {
          conversationId: this.conversationId,
          senderId: botId,
          receiverId: this.currentUserId,
          content: "Erreur: je n'arrive pas à répondre pour le moment.",
          status: 'SENT',
          createdAt: new Date().toISOString(),
        };
        this.messages = [...this.messages, botMsg];
        this.scrollToBottom();
      },
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.conversationId = +params['id'];

      // Recharge la préférence de mode par conversation.
      if (Number.isFinite(this.conversationId)) {
        this.loadAiModePreferenceForConversation(this.conversationId);
      }
      this.iaErrorCount = 0;

      this.stopPresencePolling();
      this.otherParticipantOnline = false;
      this.seenUrgentMessageIds.clear();
      this.urgentInitDone = false;
      this.loadConversationHeader();
      this.loadMessages();
      this.loadSentimentStats();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopPresencePolling();
  }

  loadSentimentStats(): void {
    this.messageService.getSentimentStats(this.conversationId).subscribe({
      next: (stats) => {
        this.sentimentStats = {
          positive: Number(stats?.positive ?? 0),
          neutral: Number(stats?.neutral ?? 0),
          negative: Number(stats?.negative ?? 0)
        };
      },
      error: (err) => console.error('Erreur chargement stats sentiment', err)
    });
  }

  loadConversationHeader(): void {
    console.log('[Chat] Chargement de la conversation ID:', this.conversationId);
    this.conversationService.getById(this.conversationId).subscribe({
      next: (conv) => {
        console.log('[Chat] Conversation reçue :', conv);
        console.log('[Chat] Conversation reçue (brute):', conv);
        console.log(
          '[Chat] Conversation clés =',
          Object.keys((conv ?? ({} as unknown)) as unknown as Record<string, unknown>)
        );

        const raw = conv as unknown as Record<string, unknown>;
        const clientIdRaw = (raw as any)?.clientId ?? (raw as any)?.client_id;
        const freelanceIdRaw = (raw as any)?.freelanceId ?? (raw as any)?.freelance_id;

        console.log('[Chat] clientId =', (raw as any)?.clientId, 'client_id =', (raw as any)?.client_id);
        console.log('[Chat] freelanceId =', (raw as any)?.freelanceId, 'freelance_id =', (raw as any)?.freelance_id);

        const clientId = Number(clientIdRaw);
        const freelanceId = Number(freelanceIdRaw);
        const currentUserId = Number(this.currentUserId);

        const isClientMe = Number.isFinite(clientId) && clientId === currentUserId;
        const isFreelanceMe = Number.isFinite(freelanceId) && freelanceId === currentUserId;

        this.otherParticipantName =
          conv.otherParticipantName ??
          (isClientMe
            ? `Freelance ${Number.isFinite(freelanceId) ? freelanceId : ''}`
            : isFreelanceMe
              ? `Client ${Number.isFinite(clientId) ? clientId : ''}`
              : 'Participant');

        // Calcule l'autre participant de façon robuste (camelCase ou snake_case)
        let otherId = 0;
        if (Number.isFinite(clientId) && clientId !== currentUserId) {
          otherId = clientId;
        } else if (Number.isFinite(freelanceId) && freelanceId !== currentUserId) {
          otherId = freelanceId;
        } else if (Number.isFinite(clientId)) {
          otherId = clientId;
        } else if (Number.isFinite(freelanceId)) {
          otherId = freelanceId;
        } else {
          console.warn('[Chat] Impossible de déterminer clientId/freelanceId depuis la conversation', {
            clientIdRaw,
            freelanceIdRaw,
            conv,
          });
        }

        this.otherParticipantId = otherId;
        console.log('[Chat] otherParticipantId =', this.otherParticipantId);
        this.currentTheme = conv.theme ?? 'default';

        // Lancer le polling maintenant que l'ID est connu
        this.startPresencePolling();
      },
      error: (err) => {
        console.error('[Chat] Erreur chargement conversation', err);
        this.otherParticipantName = 'Participant';
        this.otherParticipantId = 0;
        this.otherParticipantOnline = false;
        this.stopPresencePolling();
        this.cdr.detectChanges();
      }
    });
  }

  private stopPresencePolling(): void {
    if (this.presencePollIntervalId) {
      clearInterval(this.presencePollIntervalId);
      this.presencePollIntervalId = undefined;
    }
    this.presencePollingUserId = null;
  }

  private startPresencePolling(): void {
    if (this.presencePollIntervalId) {
      clearInterval(this.presencePollIntervalId);
      this.presencePollIntervalId = undefined;
    }

    const userId = Number(this.otherParticipantId) || 0;
    if (!userId) {
      console.log('[Chat] otherParticipantId non défini, pas de polling');
      this.otherParticipantOnline = false;
      this.presencePollingUserId = null;
      return;
    }

    // Évite de relancer inutilement si l'ID n'a pas changé
    if (this.presencePollingUserId === userId && this.presencePollIntervalId) {
      return;
    }

    this.presencePollingUserId = userId;
    console.log('[Chat] Démarrage du polling de présence pour ID', userId);

    const pollOnce = () => this.pollPresence(userId);
    pollOnce();
    this.presencePollIntervalId = setInterval(pollOnce, 30_000);
  }

  private pollPresence(userId: number): void {
    console.log('[Chat] pollPresence() appelée pour', userId);
    this.presenceService.getPresence(userId).subscribe({
      next: (res) => {
        console.log('[Chat] Réponse présence :', res);
        const nextOnline = Boolean(res?.online);
        if (nextOnline !== this.otherParticipantOnline) {
          console.log('[Chat] otherParticipantOnline changé à', nextOnline);
        }

        // Garantit que le template voit la mise à jour (au cas où)
        this.ngZone.run(() => {
          this.otherParticipantOnline = nextOnline;
          if (!this.destroyed) {
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('[Chat] Erreur présence', err);
        this.ngZone.run(() => {
          this.otherParticipantOnline = false;
          if (!this.destroyed) {
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  changeTheme(themeValue: string): void {
    this.conversationService.updateTheme(this.conversationId, themeValue).subscribe({
      next: () => (this.currentTheme = themeValue),
      error: (err) => console.error('Erreur thème', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/communication/conversations']);
  }

  loadMessages(): void {
    this.messageService.getByConversation(this.conversationId).subscribe({
      next: (data) => {
        if (this.debugLogs) console.log('[Chat] Messages reçus :', data);
        this.messages = data;
        this.markMessagesAsRead(this.messages);

        // Notification optionnelle: nouveau message urgent (sans spam au 1er chargement)
        data.forEach(msg => {
          if (msg.id != null && msg.urgent && !msg.deleted) {
            if (this.urgentInitDone && !this.seenUrgentMessageIds.has(msg.id)) {
              this.snackBar.open('🚨 Nouveau message urgent reçu !', 'OK', { duration: 5000 });
            }
            this.seenUrgentMessageIds.add(msg.id);
          }
        });
        this.urgentInitDone = true;

        this.suggestionsByMessageId.clear();
        this.suggestionsSubject.next([]);
        this.sentimentMap.clear();
        this.messages.forEach(m => {
          if (m.id != null) {
            this.loadReactionsForMessage(m.id);
          }
          if (m.id != null && !m.deleted) {
            this.loadSentimentForMessage(m.id);
            this.loadSuggestionForMessage(m.id);
          }
        });
        this.scrollToBottom();
      },
      error: (err) => console.error('Erreur chargement messages', err)
    });
  }

  private markMessagesAsRead(messages: Message[]): void {
    const toMark = (messages ?? []).filter(
      (m) => m.id != null && Number(m.receiverId) === this.currentUserId && !m.readAt
    );

    if (this.debugLogs) {
      console.log('[Chat] markMessagesAsRead candidates:', toMark.map((m) => ({ id: m.id, readAt: m.readAt, receiverId: m.receiverId })));
    }

    toMark.forEach((m) => {
      const id = Number(m.id);
      this.messageService.markAsRead(id).subscribe({
        next: () => {
          const msg = this.messages.find((x) => Number(x.id) === id);
          if (msg && !msg.readAt) msg.readAt = new Date().toISOString();
          if (this.debugLogs) console.log('[Chat] markAsRead OK for messageId', id);
        },
        error: (err) => {
          if (this.debugLogs) console.warn('[Chat] markAsRead ERROR for messageId', id, err);
        }
      });
    });
  }

  loadSentimentForMessage(messageId: number): void {
    this.messageService.getSentiment(messageId).subscribe({
      next: (sentiment) => {
        const s = (sentiment ?? '').trim().toUpperCase();
        if (s) this.sentimentMap.set(messageId, s);
      },
      error: (err) => console.error('Erreur chargement sentiment', messageId, err)
    });
  }

  /** Charge la suggestion FAQ pour un message et l'ajoute au BehaviorSubject si présente. */
  loadSuggestionForMessage(messageId: number): void {
    this.messageService.getSuggestedReply(messageId).subscribe({
      next: (reply) => {
        const text = typeof reply === 'string' ? reply.trim() : String(reply ?? '').trim();
        if (!text) return;

        const id = Number(messageId);
        const existing = this.suggestionsByMessageId.get(id);
        if (existing === text) return;

        this.suggestionsByMessageId.set(id, text);
        const nextSuggestions: Suggestion[] = Array.from(this.suggestionsByMessageId.entries()).map(
          ([mid, t]) => ({ messageId: mid, text: t })
        );
        this.suggestionsSubject.next(nextSuggestions);
      },
      error: (err) => console.error('Erreur chargement suggestion', messageId, err)
    });
  }

  /** Retourne la suggestion pour un message donné. */
  getSuggestionForMessage(suggestions: Suggestion[], messageId: number): Suggestion | undefined {
    const id = Number(messageId);
    return suggestions.find(s => s.messageId === id);
  }

  /** Insère le texte de la suggestion dans la zone de saisie. */
  useSuggestion(text: string): void {
    this.messageInputRef?.setMessageText(text);
  }

  onMessageSent(): void {
    // Pour les envois backend (ex: upload fichier), on recharge la conversation.
    this.loadMessages();
    this.loadSentimentStats();
    this.showSuggestions = false;
  }

  insertSuggestion(value: string): void {
    if (value && this.messageInputRef) {
      this.messageInputRef.setMessageText(value);
      this.showSuggestions = false;
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const el = this.chatContainer?.nativeElement;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 0);
  }

  deleteMessage(id: number): void {
    if (confirm('Supprimer ce message ?')) {
      this.messageService.delete(id).subscribe({
        next: () => {
          // Soft delete : marquer le message comme supprimé localement sans le retirer du tableau
          const msg = this.messages.find(m => m.id === id);
          if (msg) {
            msg.deleted = true;
          }
        },
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }

  editMessage(msg: Message): void {
    const newContent = prompt('Modifier le message', msg.content);
    if (newContent !== null && newContent.trim() !== '') {
      const updatedMessage = { ...msg, content: newContent.trim() };
      this.messageService.update(msg.id!, updatedMessage).subscribe({
        next: (updated) => {
          const index = this.messages.findIndex(m => m.id === updated.id);
          if (index !== -1) this.messages[index] = updated;
        },
        error: (err) => console.error('Erreur modification', err)
      });
    }
  }

  loadReactionsForMessage(messageId: number): void {
    this.messageService.getReactions(messageId).subscribe({
      next: (reactions) => {
        const grouped = this.groupReactions(reactions);
        this.reactionsMap.set(messageId, grouped);
        const userEmojis = reactions.filter(r => r.userId === this.currentUserId).map(r => r.emoji);
        this.userReactionsMap.set(messageId, new Set(userEmojis));
      },
      error: () => {
        this.reactionsMap.set(messageId, []);
        this.userReactionsMap.set(messageId, new Set());
      }
    });
  }

  groupReactions(reactions: Reaction[]): ReactionGroup[] {
    const map = new Map<string, number>();
    reactions.forEach(r => {
      map.set(r.emoji, (map.get(r.emoji) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([emoji, count]) => ({ emoji, count }));
  }

  getReactionsForMessage(messageId: number): ReactionGroup[] {
    return this.reactionsMap.get(messageId) ?? [];
  }

  isUserReacted(messageId: number, emoji: string): boolean {
    return this.userReactionsMap.get(messageId)?.has(emoji) ?? false;
  }

  toggleReaction(messageId: number, emoji: string): void {
    if (this.isUserReacted(messageId, emoji)) {
      this.messageService.removeReaction(messageId, this.currentUserId, emoji).subscribe({
        next: () => this.loadReactionsForMessage(messageId),
        error: () => {}
      });
    } else {
      this.messageService.addReaction(messageId, this.currentUserId, emoji).subscribe({
        next: () => this.loadReactionsForMessage(messageId),
        error: () => {}
      });
    }
  }

  openEmojiPicker(messageId: number): void {
    const emoji = prompt('Choisissez un emoji (ex: 👍 ❤️ 😂 😮 😢 🔥)');
    if (emoji?.trim()) {
      this.toggleReaction(messageId, emoji.trim());
    }
  }

}
