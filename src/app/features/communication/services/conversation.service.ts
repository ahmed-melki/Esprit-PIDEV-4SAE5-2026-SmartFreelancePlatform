import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation } from '../models/conversation.model';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private base = '/api/communication/conversations';

  constructor(private http: HttpClient) {}

  create(conversation: Conversation): Observable<Conversation> {
    return this.http.post<Conversation>(this.base, conversation);
  }

  getAll(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.base);
  }

  getById(id: number): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.base}/${id}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  updateTheme(id: number, theme: string): Observable<Conversation> {
    return this.http.patch<Conversation>(`${this.base}/${id}/theme?theme=${encodeURIComponent(theme)}`, {});
  }
}
