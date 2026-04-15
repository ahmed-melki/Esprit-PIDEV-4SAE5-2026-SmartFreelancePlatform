import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promotion, PromotionHealthDto } from '../models/marketing.model';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private base = '/api/promotions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.base);
  }

  getById(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.base}/${id}`);
  }

  getByCampaign(campaignId: number): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.base}/campaign/${campaignId}`);
  }

  getExpiringSoon(days: number = 7): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/expiring-soon?days=${days}`);
  }

  create(promotion: Promotion, campaignId: number): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.base}?campaignId=${campaignId}`, promotion);
  }

  update(id: number, promotion: Promotion): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.base}/${id}`, promotion);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  generateCode(campaignId: number): Observable<string> {
    return this.http.get(`${this.base}/generate-code/${campaignId}`, { responseType: 'text' });
  }

  getHealth(id: number): Observable<PromotionHealthDto> {
    return this.http.get<PromotionHealthDto>(`${this.base}/${id}/health`);
  }
}
