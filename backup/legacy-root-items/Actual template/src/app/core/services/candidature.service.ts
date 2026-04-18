import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature } from '../models/candidature.model';

@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl = 'http://localhost:8052/api/candidatures';

  constructor(private http: HttpClient) {}

  /** Apply to a job — backend requires quiz to be passed first */
  postuler(jobId: number, candidatId: number, lettreMotivation: string, cvUrl: string): Observable<Candidature> {
    return this.http.post<Candidature>(
      `${this.apiUrl}/postuler?jobId=${jobId}&candidatId=${candidatId}`,
      { lettreMotivation, cvUrl }
    );
  }

  getMyCandidatures(candidatId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/candidat/${candidatId}`);
  }

  getCandidaturesByJob(jobId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/job/${jobId}`);
  }

  updateStatus(candidatureId: number, status: string): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/${candidatureId}/status?status=${status}`, {});
  }
}
