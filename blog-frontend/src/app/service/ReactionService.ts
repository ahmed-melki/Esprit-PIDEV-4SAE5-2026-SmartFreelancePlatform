// services/reaction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ToggleReactionResponse, UserReactionResponse } from '../models/reaction.model';

@Injectable({
    providedIn: 'root'
})
export class ReactionService {
    private apiUrl = 'http://localhost:8082/piblog/api/reactions';
    
    constructor(private http: HttpClient) {}
    
    // Générer ou récupérer l'ID de session
    getSessionId(): string {
        let sessionId = localStorage.getItem('reaction_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('reaction_session_id', sessionId);
        }
        return sessionId;
    }
    
    // Toggle Like/Dislike
    toggleReaction(articleId: number, reactionType: 'LIKE' | 'DISLIKE'): Observable<ToggleReactionResponse> {
        const params = new HttpParams()
            .set('articleId', articleId.toString())
            .set('sessionId', this.getSessionId())
            .set('reactionType', reactionType);
        
        return this.http.post<ToggleReactionResponse>(`${this.apiUrl}/toggle`, null, { params });
    }
    
  
}