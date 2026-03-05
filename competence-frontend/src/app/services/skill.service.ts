import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Skill, Rating } from '../models/skill.model';
import { BASE_URL } from '@core';

/**
 * Service d'accès aux API compétences et notes.
 * Utilise BASE_URL (/apiskill) pour passer par la gateway.
 */
@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(BASE_URL);

  // ========== skill ==========
  getAllSkills(): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}/competence/retrieve-all-competence`);
  }

  getSkillById(id: number): Observable<Skill> {
    return this.http.get<Skill>(`${this.baseUrl}/competence/retrieve-skill/${id}`);
  }

  createSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(`${this.baseUrl}/competence/add-skill`, skill);
  }

  updateSkill(skill: Skill): Observable<Skill> {
    return this.http.put<Skill>(`${this.baseUrl}/competence/modify-skill`, skill);
  }

  deleteSkill(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/competence/remove-skill/${id}`);
  }

  getSkillByNiveau(niveau: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}/competence/retrieve-competence-by-niveau/${niveau}`);
  }

  searchSkillByName(nom: string): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}/competence/search-competence-by-name/${nom}`);
  }

  // ========== RATINGS ==========
  getAllRatings(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.baseUrl}/api/ratings/retrieve-all-ratings`);
  }

  getRatingsBySkill(skillId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.baseUrl}/api/ratings/retrieve-ratings-by-skill/${skillId}`);
  }

  addRating(rating: Rating, skillId: number): Observable<Rating> {
    return this.http.post<Rating>(`${this.baseUrl}/api/ratings/add-rating/${skillId}`, rating);
  }

  updateRating(rating: Rating): Observable<Rating> {
    return this.http.put<Rating>(`${this.baseUrl}/api/ratings/modify-rating`, rating);
  }

  deleteRating(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/ratings/remove-rating/${id}`);
  }

  getAverageRating(skillId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/api/ratings/average-rating/${skillId}`);
  }

  getRatingsCount(skillId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/api/ratings/count-ratings/${skillId}`);
  }
}
