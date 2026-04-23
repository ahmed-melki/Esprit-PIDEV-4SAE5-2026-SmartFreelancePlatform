import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Conversation } from '../models/conversation.model';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private apiUrl = '/api/communication/conversations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Conversation[]> {
    return this.http
      .get<Conversation[] | Record<string, unknown>[]>(this.apiUrl)
      .pipe(map((data) => (Array.isArray(data) ? data.map((c) => this.normalizeConversation(c)) : [])));
  }

  private normalizeConversation(c: Conversation | Record<string, unknown>): Conversation {
    const any = c as Record<string, unknown>;
    return {
      id: any.id as number | undefined,
      clientId: (any.clientId ?? any.client_id) as number,
      freelanceId: (any.freelanceId ?? any.freelance_id) as number,
      projectId: (any.projectId ?? any.project_id) as number,
      status: (any.status ?? 'ACTIVE') as Conversation['status'],
      otherParticipantName: (any.otherParticipantName ?? any.other_participant_name) as string | undefined,
      lastMessageContent: (any.lastMessageContent ?? any.last_message_content) as string | undefined,
      lastMessageTime: (any.lastMessageTime ?? any.last_message_time) as string | undefined,
      lastMessageSenderId: (any.lastMessageSenderId ?? any.last_message_sender_id) as number | undefined,
      unreadCount: (any.unreadCount ?? any.unread_count) as number | undefined,
      theme: (any.theme as string | undefined) ?? undefined,
      urgentCount: Number((any.urgentCount ?? any.urgent_count ?? 0) as any)
    } as Conversation;
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Optionnel : ajoute ces méthodes si besoin
  getById(id: number): Observable<Conversation> {
    return this.http
      .get<Conversation | Record<string, unknown>>(`${this.apiUrl}/${id}`)
      .pipe(map((c) => this.normalizeConversation(c as Record<string, unknown>)));
  }

  create(conversation: Conversation): Observable<Conversation> {
    return this.http.post<Conversation>(this.apiUrl, conversation);
  }

  updateTheme(id: number, theme: string): Observable<Conversation> {
    const params = new HttpParams().set('theme', theme);
    return this.http
      .patch<Conversation | Record<string, unknown>>(`${this.apiUrl}/${id}/theme`, null, { params })
      .pipe(map((c) => this.normalizeConversation(c as Record<string, unknown>)));
  }
}