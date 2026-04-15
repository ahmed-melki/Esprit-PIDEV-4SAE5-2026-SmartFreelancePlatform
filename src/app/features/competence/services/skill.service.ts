import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Skill, StatistiquesGlobalesDto, StatistiqueCompetenceDto } from '../models/competence.model';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private base = '/competence';
  private statsBase = '/api/statistiques';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.base}/retrieve-all-competence`);
  }

  getById(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.base}/retrieve-skill/${id}`);
  }

  create(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(`${this.base}/add-skill`, skill);
  }

  update(skill: Skill): Observable<Skill> {
    return this.http.put<Skill>(`${this.base}/modify-skill`, skill);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/remove-skill/${id}`);
  }

  getByNiveau(niveau: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.base}/retrieve-competence-by-niveau/${niveau}`);
  }

  searchByName(nom: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.base}/search-competence-by-name/${nom}`);
  }

  // Stats
  getGlobalStats(): Observable<StatistiquesGlobalesDto> {
    return this.http.get<StatistiquesGlobalesDto>(`${this.statsBase}/global`);
  }

  getSkillStats(id: number): Observable<StatistiqueCompetenceDto> {
    return this.http.get<StatistiqueCompetenceDto>(`${this.statsBase}/competences/${id}/notes`);
  }
}
