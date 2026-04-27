import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, ArticleReport } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private base = 'http://localhost:8071/api/articles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.base);
  }

  getById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.base}/${id}`);
  }

  create(article: Article): Observable<Article> {
    return this.http.post<Article>(this.base, article);
  }

  update(id: number, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.base}/${id}`, article);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  report(id: number, report: ArticleReport): Observable<any> {
    return this.http.post<any>(`${this.base}/${id}/report`, report);
  }

  getReports(id: number): Observable<ArticleReport[]> {
    return this.http.get<ArticleReport[]>(`${this.base}/${id}/reports`);
  }
}
