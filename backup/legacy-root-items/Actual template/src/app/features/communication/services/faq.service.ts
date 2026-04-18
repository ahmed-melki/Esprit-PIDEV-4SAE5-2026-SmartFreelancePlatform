import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Faq } from '../models/faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private base = '/faqs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Faq[]> {
    return this.http.get<Faq[]>(this.base);
  }

  getById(id: number): Observable<Faq> {
    return this.http.get<Faq>(`${this.base}/${id}`);
  }

  create(faq: Faq): Observable<Faq> {
    return this.http.post<Faq>(this.base, faq);
  }

  update(id: number, faq: Faq): Observable<Faq> {
    return this.http.put<Faq>(`${this.base}/${id}`, faq);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  suggestReply(content: string): Observable<string> {
    return this.http.post(`${this.base}/suggest`, { content }, { responseType: 'text' });
  }
}
