import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatAiService {
  private base = '/api/chat';

  constructor(private http: HttpClient) {}

  ask(message: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(this.base, { message });
  }
}
