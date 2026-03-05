import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@core';

export interface RepartitionNiveau {
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'EXPERT';
  total: number;
}

export interface StatistiquesGlobales {
  totalCompetences: number;
  totalNotes: number;
  noteMoyenneGlobale: number;
  repartitionParNiveau: RepartitionNiveau[];
}

/**
 * Service responsable d'appeler les endpoints de statistiques du backend.
 */
@Injectable({
  providedIn: 'root',
})
export class StatistiquesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(BASE_URL);

  /**
   * Appelle GET {baseUrl}/api/statistiques/global via la gateway.
   */
  getGlobalStats(): Observable<StatistiquesGlobales> {
    return this.http.get<StatistiquesGlobales>(`${this.baseUrl}/api/statistiques/global`);
  }

  /**
   * Statistiques d'une compétence (nombre de notes, note moyenne).
   * Utilisé pour le graphique "top compétences par note moyenne".
   */
  getStatistiquesCompetence(skillId: number): Observable<StatistiqueCompetenceDto> {
    return this.http.get<StatistiqueCompetenceDto>(
      `${this.baseUrl}/api/statistiques/competences/${skillId}/notes`
    );
  }
}

export interface StatistiqueCompetenceDto {
  idSkill: number;
  nomSkill: string;
  nombreNotes: number;
  noteMoyenne: number;
}

