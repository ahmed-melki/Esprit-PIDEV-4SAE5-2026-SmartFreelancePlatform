// service/article.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = 'http://localhost:8082/piblog/api/articles';
  private reactionUrl = 'http://localhost:8082/piblog/api/reactions';

  constructor(private http: HttpClient) {}

  // ========== MÉTHODES CRUD ==========
  
  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }

  getById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  create(article: Article): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article);
  }

  update(id: number, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== MÉTHODES POUR LES RÉACTIONS (LIKE/DISLIKE) ==========
  
  private getSessionId(): string {
    let sessionId = localStorage.getItem('blog_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('blog_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * ✅ TOGGLE LIKE/DISLIKE - CORRIGÉ : utilise BODY JSON au lieu de query params
   */
  toggleReaction(articleId: number, reactionType: 'LIKE' | 'DISLIKE'): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    // ✅ Envoi en BODY JSON (pas en query params)
    const body = {
      articleId: articleId,
      sessionId: this.getSessionId(),
      reactionType: reactionType
    };
    
    console.log('📤 Envoi Like/Dislike (BODY JSON):', body);
    
    return this.http.post(`${this.reactionUrl}/toggle`, body, { headers });
  }

  /**
   * ✅ GET USER REACTION - Utilise query params (correct pour GET)
   */
  getUserReaction(articleId: number): Observable<any> {
    const sessionId = this.getSessionId();
    const params = new HttpParams()
      .set('articleId', articleId.toString())
      .set('sessionId', sessionId);
    
    console.log('📥 Récupération réaction user:', `${this.reactionUrl}/user`, { params });
    
    return this.http.get(`${this.reactionUrl}/user`, { params });
  }

  // ========== MÉTHODES POUR LE SIGNALEMENT ==========
  
  reportArticle(articleId: number, reason: string): Observable<any> {
    const body = {
      reason: reason,
      articleId: articleId,
      reportedAt: new Date(),
      status: "pending"
    };
    return this.http.post(`${this.apiUrl}/${articleId}/report`, body);
  }

  submitReport(report: { 
    reportedAt: Date; 
    status: string; 
    reason: string; 
    description: string; 
    reporterName: string; 
    email: string; 
    articleId: number | null; 
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${report.articleId}/report`, report);
  }

  getReportsByArticleId(articleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${articleId}/reports`);
  }

  // ========== MÉTHODES SUPPLÉMENTAIRES ==========
  
  getTopArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/top`);
  }

  getViralArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.apiUrl}/viral`);
  }

  getArticleBadge(articleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${articleId}/badge`);
  }

  getArticleScore(articleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${articleId}/score`);
  }
}