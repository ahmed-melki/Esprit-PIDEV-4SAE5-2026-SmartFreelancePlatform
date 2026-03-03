import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ReactionService {

  private baseUrl = 'http://localhost:8081/pi/api/events';

  constructor(private http: HttpClient) {}

  // src/app/services/event-reaction.service.ts
react(eventId: number, type: string) {
  return this.http.post(
    `${this.baseUrl}/${eventId}/react?type=${type}`,
    {} // corps vide car tout est en query param
  );
}

  getStats(eventId: number) {
    return this.http.get<any>(`${this.baseUrl}/${eventId}/stats`);
  }
}