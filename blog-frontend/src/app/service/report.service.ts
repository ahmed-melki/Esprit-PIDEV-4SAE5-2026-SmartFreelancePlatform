import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ArticleReport } from '../models/articleReport.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8082/piblog/api/articles';

  constructor(private http: HttpClient) {}

  // Signaler un article
  reportArticle(articleId: number, report: ArticleReport): Observable<any> {
    return this.http.post(`${this.apiUrl}/${articleId}/report`, report);
  }

  // Récupérer tous les signalements d'un article
  getReportsByArticle(articleId: number): Observable<ArticleReport[]> {
    return this.http.get<ArticleReport[]>(`${this.apiUrl}/${articleId}/reports`);
  }
}