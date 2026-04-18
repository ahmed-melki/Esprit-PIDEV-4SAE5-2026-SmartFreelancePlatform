import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private base = '/messages';

  constructor(private http: HttpClient) {}

  send(message: Message): Observable<Message> {
    const hardcoded = {
      ...message,
      senderId: 1,
      receiverId: 2
    };
    return this.http.post<Message>(this.base, hardcoded);
  }

  getByConversation(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.base}/conversation/${conversationId}`);
  }

  getById(id: number): Observable<Message> {
    return this.http.get<Message>(`${this.base}/${id}`);
  }

  update(id: number, message: Message): Observable<Message> {
    return this.http.put<Message>(`${this.base}/${id}`, message);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadFile(formData: FormData): Observable<Message> {
    return this.http.post<Message>(`${this.base}/upload`, formData);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, {});
  }

  getSentiment(id: number): Observable<string> {
    return this.http.get(`${this.base}/${id}/sentiment`, { responseType: 'text' });
  }

  getSentimentStats(conversationId: number): Observable<{ positive: number; neutral: number; negative: number }> {
    return this.http.get<any>(`${this.base}/conversation/${conversationId}/sentiment-stats`);
  }

  getSuggestedReply(id: number): Observable<string> {
    return this.http.get(`${this.base}/${id}/suggested-reply`, { responseType: 'text' });
  }

  getReadStatus(id: number): Observable<string> {
    return this.http.get(`${this.base}/${id}/read-status`, { responseType: 'text' });
  }
}
