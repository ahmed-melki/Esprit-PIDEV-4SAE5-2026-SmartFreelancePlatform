import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature, Entretien } from '../models/candidature.model';

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

  updateStatut(candidatureId: number, statut: Candidature['statut'], commentaire: string): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/${candidatureId}/statut`, { statut, commentaire });
  }

  // Kept for backward compatibility with existing UI calls.
  updateStatus(candidatureId: number, status: string): Observable<Candidature> {
    return this.updateStatut(candidatureId, status as Candidature['statut'], '');
  }

  getCandidatureById(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.apiUrl}/${id}`);
  }

  getStatsByJob(jobId: number): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/job/${jobId}/stats`);
  }

  planifierEntretien(candidatureId: number, dateHeure: string, lienVisio: string): Observable<Entretien> {
    return this.http.post<Entretien>(`${this.apiUrl}/${candidatureId}/entretien`, { dateHeure, lienVisio });
  }

  getEntretiensByCandidature(candidatureId: number): Observable<Entretien[]> {
    return this.http.get<Entretien[]>(`${this.apiUrl}/entretien/candidature/${candidatureId}`);
  }
}
