import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating } from '../models/competence.model';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private base = '/api/ratings';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.base}/retrieve-all-ratings`);
  }

  getById(id: number): Observable<Rating> {
    return this.http.get<Rating>(`${this.base}/retrieve-rating/${id}`);
  }

  addRating(rating: Rating, skillId: number): Observable<Rating> {
    return this.http.post<Rating>(`${this.base}/add-rating/${skillId}`, rating);
  }

  removeRating(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/remove-rating/${id}`);
  }

  updateRating(rating: Rating): Observable<Rating> {
    return this.http.put<Rating>(`${this.base}/modify-rating`, rating);
  }

  getBySkill(skillId: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.base}/retrieve-ratings-by-skill/${skillId}`);
  }

  getAverageForSkill(skillId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/average-rating/${skillId}`);
  }

  getCountForSkill(skillId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/count-ratings/${skillId}`);
  }
}
