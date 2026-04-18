import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReactionResponse, UserReactionStatus, ReactionType } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class ReactionService {
  private base = 'http://localhost:8073/api/reactions';
  private sessionId: string;

  constructor(private http: HttpClient) {
    // Basic session management (session-based for now)
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let id = localStorage.getItem('blog_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('blog_session_id', id);
    }
    return id;
  }

  toggleReaction(articleId: number, reactionType: ReactionType): Observable<ReactionResponse> {
    return this.http.post<ReactionResponse>(`${this.base}/toggle`, {
      articleId,
      sessionId: this.sessionId,
      reactionType
    });
  }

  getUserReaction(articleId: number): Observable<UserReactionStatus> {
    return this.http.get<UserReactionStatus>(`${this.base}/user`, {
      params: { 
        articleId: articleId.toString(),
        sessionId: this.sessionId
      }
    });
  }
}
