import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Training } from '../models/models';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrainingService {

  private api = `${environment.apiUrl}/trainings`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Training[]> {
    return this.http.get<Training[]>(this.api);
  }

  create(training: Training): Observable<Training> {
    return this.http.post<Training>(this.api, training);
  }

  update(id: number, training: Training): Observable<Training> {
    return this.http.put<Training>(`${this.api}/${id}`, training);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
