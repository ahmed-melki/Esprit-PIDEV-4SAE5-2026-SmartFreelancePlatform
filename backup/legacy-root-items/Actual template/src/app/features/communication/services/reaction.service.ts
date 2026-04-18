import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reaction } from '../models/reaction.model';

@Injectable({ providedIn: 'root' })
export class ReactionService {
  private base = '/reactions';

  constructor(private http: HttpClient) {}

  add(messageId: number, userId: number, emoji: string): Observable<Reaction> {
    return this.http.post<Reaction>(
      `${this.base}/message/${messageId}?userId=${userId}&emoji=${encodeURIComponent(emoji)}`,
      {}
    );
  }

  remove(messageId: number, userId: number, emoji: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/message/${messageId}?userId=${userId}&emoji=${encodeURIComponent(emoji)}`
    );
  }

  getByMessage(messageId: number): Observable<Reaction[]> {
    return this.http.get<Reaction[]>(`${this.base}/message/${messageId}`);
  }
}
