import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private base = '/api/communication/messages';

  constructor(private http: HttpClient) {}

  send(message: Message): Observable<Message> {
    return this.http.post<Message>(this.base, message);
  }

  getByConversation(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/conversation/${conversationId}`);
  }

  getById(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.base}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  update(id: number, content: string): Observable<Message> {
    return this.http.put<Message>(`${this.base}/${id}`, { content });
  }

  /**
   * Triggers sentiment analysis on the backend (if supported).
   * Falls back to GET /sentiment if the POST endpoint isn't available.
   */
  analyzeSentiment(id: number): Observable<Message | { sentiment: string } | string> {
    return this.http.post<Message | { sentiment: string } | string>(`${this.base}/${id}/analyze-sentiment`, {}).pipe(
      catchError(() => this.http.get<Message | { sentiment: string } | string>(`${this.base}/${id}/sentiment`))
    );
  }

  /**
   * Returns the persisted sentiment value (if supported by the backend).
   */
  getSentiment(id: number): Observable<{ sentiment: string } | string> {
    return this.http.get<{ sentiment: string } | string>(`${this.base}/${id}/sentiment`);
  }

  uploadAttachment(messageId: number, file: File): Observable<Message> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<Message>(`${this.base}/${messageId}/attachments`, form);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, {});
  }
}
