import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = 'http://localhost:8089/Communication/api/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<string> {
    const payload: ChatRequest = { message: (message ?? '').trim() };
    return this.http.post<ChatResponse>(this.apiUrl, payload).pipe(map((res) => (res?.response ?? '').trim()));
  }
}
