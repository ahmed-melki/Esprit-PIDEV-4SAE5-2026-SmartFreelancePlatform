import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Certification } from '../models/models';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CertificationService {

  private api = `${environment.apiUrl}/certifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Certification[]> {
    return this.http.get<Certification[]>(this.api);
  }

  getByClient(clientId: number): Observable<Certification[]> {
    return this.http.get<Certification[]>(`${this.api}/client/${clientId}`);
  }

  create(cert: Certification, clientId: number, trainingId: number): Observable<Certification> {
    return this.http.post<Certification>(`${this.api}?clientId=${clientId}&trainingId=${trainingId}`, cert);
  }

  update(id: number, cert: Certification, clientId: number, trainingId: number): Observable<Certification> {
    return this.http.put<Certification>(`${this.api}/${id}?clientId=${clientId}&trainingId=${trainingId}`, cert);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
