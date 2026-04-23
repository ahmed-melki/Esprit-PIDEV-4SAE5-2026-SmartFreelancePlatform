import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from '../models/message.model';
import { Reaction } from '../models/reaction.model';

export interface SentimentStats {
  positive: number;
  neutral: number;
  negative: number;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = '/api/communication/messages';
  private reactionsBaseUrl = '/api/communication/reactions';

  constructor(private http: HttpClient) {}

  getByConversation(conversationId: number): Observable<Message[]> {
    return this.http
      .get<Message[] | { data?: Message[]; content?: Message[] }>(`${this.apiUrl}/conversation/${conversationId}`)
      .pipe(map((response) => this.normalizeMessageList(response)));
  }

  send(message: Message): Observable<Message> {
    return this.http.post<Message>(this.apiUrl, message);
  }

  update(id: number, message: Message): Observable<Message> {
    return this.http.put<Message>(`${this.apiUrl}/${id}`, message);
  }

  markAsRead(messageId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${messageId}/read`, null);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Suggestion de réponse basée sur la FAQ (backend). Accepte texte brut ou JSON { reply: string }. */
  getSuggestedReply(messageId: number): Observable<string> {
    return this.http
      .get(`${this.apiUrl}/${messageId}/suggested-reply`, { responseType: 'text' as const })
      .pipe(map((raw) => this.normalizeSuggestedReply(raw)));
  }

  /** Sentiment du message (backend). Réponse texte brut: POSITIVE | NEUTRAL | NEGATIVE. */
  getSentiment(messageId: number): Observable<string> {
    return this.http
      .get(`${this.apiUrl}/${messageId}/sentiment`, { responseType: 'text' as const })
      .pipe(map((raw) => (raw ?? '').trim().toUpperCase()));
  }

  /** Statistiques de sentiment par conversation. */
  getSentimentStats(conversationId: number): Observable<SentimentStats> {
    return this.http.get<SentimentStats>(`${this.apiUrl}/conversation/${conversationId}/sentiment-stats`);
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

  private normalizeOptionalIsoString(value: unknown): string | undefined {
    if (value == null) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const lower = trimmed.toLowerCase();
      if (lower === 'null' || lower === 'undefined') return undefined;
      return trimmed;
    }
    return String(value);
  }

  private coerceNumber(value: unknown): number | undefined {
    if (value == null) return undefined;
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const n = Number(trimmed);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  }

  /** Extrait le texte de la suggestion (texte brut ou JSON {"reply":"..."}). */
  private normalizeSuggestedReply(raw: string): string {
    const trimmed = (raw ?? '').trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed) as { reply?: string; message?: string };
        return ((parsed?.reply ?? parsed?.message ?? '') as string).trim();
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }

  uploadFile(formData: FormData): Observable<Message> {
    return this.http
      .post<Message | Record<string, unknown>>(`${this.apiUrl}/upload`, formData)
      .pipe(map((res) => this.normalizeSingleMessage(res)));
  }

  private normalizeSingleMessage(m: Message | Record<string, unknown>): Message {
    if (!m || typeof m !== 'object') return m as Message;
    const any = m as Record<string, unknown>;
    const rawFileUrl = (any.fileUrl ?? any.file_url) as string | undefined;
    return {
      id: any.id as number,
      conversationId: (any.conversationId ?? any.conversation_id) as number,
      senderId: (any.senderId ?? any.sender_id) as number,
      receiverId: (any.receiverId ?? any.receiver_id) as number,
      content: (any.content ?? '') as string,
      status: (any.status ?? 'SENT') as Message['status'],
      readAt: this.normalizeOptionalIsoString(any.readAt ?? any.read_at),
      createdAt: this.normalizeOptionalIsoString(any.createdAt ?? any.created_at),
      fileUrl: this.normalizeFileUrl(rawFileUrl),
      fileName: (any.fileName ?? any.file_name) as string | undefined,
      fileSize: (any.fileSize ?? any.file_size) as number | undefined,
      deleted: this.coerceBoolean(any.deleted),
      inappropriate: this.coerceBoolean(any.inappropriate),
      urgent: this.coerceBoolean(any.urgent),

      // Partage de position (backend: isLocation/location + champs lat/lng)
      location: this.coerceBoolean(any.location ?? any.isLocation ?? any.is_location),
      locationLat: this.coerceNumber(any.locationLat ?? any.location_lat ?? any.locationLatitute ?? any.location_latitude),
      locationLng: this.coerceNumber(any.locationLng ?? any.location_lng ?? any.locationLongitude ?? any.location_longitude)
    } as Message;
  }

  /** Garantit que l’URL du fichier passe par le proxy (/api/communication/uploads/...). */
  private normalizeFileUrl(url: string | undefined): string | undefined {
    if (!url || typeof url !== 'string') return url;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/Communication/uploads')) return '/api/communication' + url;
    return url;
  }

  getReactions(messageId: number): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(`${this.reactionsBaseUrl}/message/${messageId}`);
  }

  addReaction(messageId: number, userId: number, emoji: string): Observable<Reaction> {
    const params = new HttpParams().set('userId', userId.toString()).set('emoji', emoji);
    return this.http.post<Reaction>(`${this.reactionsBaseUrl}/message/${messageId}`, null, { params });
  }

  removeReaction(messageId: number, userId: number, emoji: string): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString()).set('emoji', emoji);
    return this.http.delete<void>(`${this.reactionsBaseUrl}/message/${messageId}`, { params });
  }

  /**
   * Accepte une réponse tableau ou encapsulée ({ data: [] } / { content: [] })
   * et normalise les champs snake_case → camelCase pour compatibilité backend.
   */
  private normalizeMessageList(response: Message[] | { data?: Message[]; content?: Message[] }): Message[] {
    let list: unknown[] = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (response?.data && Array.isArray(response.data)) {
      list = response.data;
    } else if (response && typeof response === 'object' && 'content' in response && Array.isArray((response as { content: unknown[] }).content)) {
      list = (response as { content: unknown[] }).content;
    }
    return list.map((m: any) => ({
      id: m.id,
      conversationId: m.conversationId ?? m.conversation_id,
      senderId: m.senderId ?? m.sender_id,
      receiverId: m.receiverId ?? m.receiver_id,
      content: m.content ?? '',
      status: m.status ?? 'SENT',
      readAt: this.normalizeOptionalIsoString(m.readAt ?? m.read_at),
      createdAt: this.normalizeOptionalIsoString(m.createdAt ?? m.created_at),
      fileUrl: this.normalizeFileUrl(m.fileUrl ?? m.file_url),
      fileName: m.fileName ?? m.file_name,
      fileSize: m.fileSize ?? m.file_size,
      deleted: this.coerceBoolean(m.deleted),
      inappropriate: this.coerceBoolean(m.inappropriate),
      urgent: this.coerceBoolean(m.urgent),

      location: this.coerceBoolean(m.location ?? m.isLocation ?? m.is_location),
      locationLat: this.coerceNumber(m.locationLat ?? m.location_lat ?? m.location_latitude),
      locationLng: this.coerceNumber(m.locationLng ?? m.location_lng ?? m.location_longitude)
    })) as Message[];
  }
}
