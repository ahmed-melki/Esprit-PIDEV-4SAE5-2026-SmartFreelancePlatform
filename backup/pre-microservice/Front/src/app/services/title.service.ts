import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Title, UserTitle } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TitleService {

  private api = `${environment.apiUrl}/titles`;

  constructor(private http: HttpClient) {}

  getAllTitles(): Observable<Title[]> {
    return this.http.get<Title[]>(this.api);
  }

  getUserTitles(clientId: number): Observable<UserTitle[]> {
    return this.http.get<UserTitle[]>(`${this.api}/user/${clientId}`);
  }

  checkAndUnlockTitles(clientId: number): Observable<Title[]> {
    return this.http.post<Title[]>(`${this.api}/check/${clientId}`, {});
  }

  initializeTitles(): Observable<string> {
    return this.http.post<string>(`${this.api}/initialize`, {});
  }
}
