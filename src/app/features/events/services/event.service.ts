import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, ReactionType, ReactionStats } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private base = '/pi/api/events';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.base);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.base}/${id}`);
  }

  create(event: Event): Observable<Event> {
    return this.http.post<Event>(this.base, event);
  }

  update(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.base}/${id}`, event);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  react(eventId: number, type: ReactionType): Observable<string> {
    const params = new HttpParams().set('type', type);
    return this.http.post(`${this.base}/${eventId}/react`, {}, { params, responseType: 'text' });
  }

  getStats(eventId: number): Observable<ReactionStats> {
    return this.http.get<ReactionStats>(`${this.base}/${eventId}/stats`);
  }
}
