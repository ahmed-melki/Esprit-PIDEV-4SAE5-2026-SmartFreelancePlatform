import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BadWord } from '../models/bad-word.model';

@Injectable({ providedIn: 'root' })
export class BadWordService {
  private base = '/bad-words';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BadWord[]> {
    return this.http.get<BadWord[]>(this.base);
  }

  create(badWord: BadWord): Observable<BadWord> {
    return this.http.post<BadWord>(this.base, badWord);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
