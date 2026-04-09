// src/app/candidatures/candidature.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// ========== ENUMS ==========
export enum StatutCandidature {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS_EXAMEN = 'EN_COURS_EXAMEN',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE',
  ENTRETIEN_PLANIFIE = 'ENTRETIEN_PLANIFIE',
  ENTRETIEN_REALISE = 'ENTRETIEN_REALISE',
  EMBAUCHE = 'EMBAUCHE',
  ARCHIVEE = 'ARCHIVEE'
}

export enum StatutEntretien {
  PLANIFIE = 'PLANIFIE',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE'
}

// ========== INTERFACES ==========
export interface JobOfferSimple {
  id: number;
  title: string;
  company: string;
  location: string;
  contractType: string;
  salaryMin: number;
  salaryMax: number;
}

export interface Candidature {
  id: number;
  jobOffer: JobOfferSimple;
  candidatId: number;
  lettreMotivation: string;
  cvUrl: string;
  statut: StatutCandidature;
  datePostulation: string;
  dateDerniereModification: string;
  commentaireRecruteur?: string;
}

export interface Entretien {
  id: number;
  candidatureId: number;
  dateHeure: string;
  lienVisio: string;
  dureeMinutes: string;
  notes: string;
  statut: StatutEntretien;
}

export interface StatistiquesCandidatures {
  total: number;
  enAttente: number;
  enCoursExamen: number;
  entretienPlanifie: number;
  acceptees: number;
  refusees: number;
}

// ========== SERVICE ==========
@Injectable({
  providedIn: 'root'
})
export class CandidatureService {
  private apiUrl = 'http://localhost:8052/api/candidatures';
  private fileUrl = 'http://localhost:8052/api/files';

  constructor(private http: HttpClient) { }

  // ========== CANDIDATURE ==========
  
  postuler(jobId: number, candidatId: number, lettreMotivation: string, cvUrl: string): Observable<Candidature> {
    return this.http.post<Candidature>(`${this.apiUrl}/postuler?jobId=${jobId}&candidatId=${candidatId}`, {
      lettreMotivation,
      cvUrl
    });
  }

  getCandidaturesByJob(jobId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/job/${jobId}`);
  }

  getCandidaturesByCandidat(candidatId: number): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.apiUrl}/candidat/${candidatId}`);
  }

  getCandidatureById(id: number): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.apiUrl}/${id}`);
  }

  updateStatut(candidatureId: number, statut: string, commentaire: string): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.apiUrl}/${candidatureId}/statut`, { statut, commentaire });
  }

  getStatsByJob(jobId: number): Observable<StatistiquesCandidatures> {
    return this.http.get<StatistiquesCandidatures>(`${this.apiUrl}/job/${jobId}/stats`);
  }

  // ========== ENTRETIEN ==========
  
  planifierEntretien(candidatureId: number, dateHeure: string, lienVisio: string): Observable<Entretien> {
    return this.http.post<Entretien>(`${this.apiUrl}/${candidatureId}/entretien`, { dateHeure, lienVisio });
  }

  getEntretiensByCandidature(candidatureId: number): Observable<Entretien[]> {
    return this.http.get<Entretien[]>(`${this.apiUrl}/entretien/candidature/${candidatureId}`);
  }

  // ========== UPLOAD CV ==========
  
 uploadCV(file: File): Observable<string> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<string>(`${this.fileUrl}/upload/cv`, formData, { responseType: 'text' as 'json' });
}

  postulerAvecFichier(jobId: number, userId: number, lettreMotivation: string, cvFile: File): Observable<Candidature> {
  return this.uploadCV(cvFile).pipe(
    switchMap((cvUrl: string) => {
      return this.postuler(jobId, userId, lettreMotivation, cvUrl);
    })
  );
}

  // ========== TÉLÉCHARGER CV ==========
  
  downloadCV(cvUrl: string): Observable<Blob> {
  return this.http.get(cvUrl, { responseType: 'blob' });
}

  // ========== MÉTHODES UTILITAIRES ==========
  
  getStatutLabel(statut: StatutCandidature): string {
    const labels: Record<StatutCandidature, string> = {
      [StatutCandidature.EN_ATTENTE]: '📋 En attente',
      [StatutCandidature.EN_COURS_EXAMEN]: '🔍 En cours d\'examen',
      [StatutCandidature.ENTRETIEN_PLANIFIE]: '📅 Entretien planifié',
      [StatutCandidature.ENTRETIEN_REALISE]: '✅ Entretien réalisé',
      [StatutCandidature.ACCEPTEE]: '🎉 Acceptée',
      [StatutCandidature.REFUSEE]: '❌ Refusée',
      [StatutCandidature.EMBAUCHE]: '💼 Embauche',
      [StatutCandidature.ARCHIVEE]: '📦 Archivée'
    };
    return labels[statut] || statut;
  }

  getStatutColor(statut: StatutCandidature): string {
    const colors: Record<StatutCandidature, string> = {
      [StatutCandidature.EN_ATTENTE]: '#ff9800',
      [StatutCandidature.EN_COURS_EXAMEN]: '#2196f3',
      [StatutCandidature.ENTRETIEN_PLANIFIE]: '#9c27b0',
      [StatutCandidature.ENTRETIEN_REALISE]: '#00bcd4',
      [StatutCandidature.ACCEPTEE]: '#4caf50',
      [StatutCandidature.REFUSEE]: '#f44336',
      [StatutCandidature.EMBAUCHE]: '#8bc34a',
      [StatutCandidature.ARCHIVEE]: '#9e9e9e'
    };
    return colors[statut] || '#9e9e9e';
  }

  getStatutClass(statut: StatutCandidature): string {
    const classes: Record<StatutCandidature, string> = {
      [StatutCandidature.EN_ATTENTE]: 'status-pending',
      [StatutCandidature.EN_COURS_EXAMEN]: 'status-review',
      [StatutCandidature.ENTRETIEN_PLANIFIE]: 'status-interview',
      [StatutCandidature.ENTRETIEN_REALISE]: 'status-interview-done',
      [StatutCandidature.ACCEPTEE]: 'status-accepted',
      [StatutCandidature.REFUSEE]: 'status-rejected',
      [StatutCandidature.EMBAUCHE]: 'status-hired',
      [StatutCandidature.ARCHIVEE]: 'status-archived'
    };
    return classes[statut] || '';
  }

  getStatutIcon(statut: StatutCandidature): string {
    const icons: Record<StatutCandidature, string> = {
      [StatutCandidature.EN_ATTENTE]: 'hourglass_empty',
      [StatutCandidature.EN_COURS_EXAMEN]: 'search',
      [StatutCandidature.ENTRETIEN_PLANIFIE]: 'calendar_month',
      [StatutCandidature.ENTRETIEN_REALISE]: 'check_circle',
      [StatutCandidature.ACCEPTEE]: 'celebration',
      [StatutCandidature.REFUSEE]: 'cancel',
      [StatutCandidature.EMBAUCHE]: 'work',
      [StatutCandidature.ARCHIVEE]: 'archive'
    };
    return icons[statut] || 'info';
  }
}