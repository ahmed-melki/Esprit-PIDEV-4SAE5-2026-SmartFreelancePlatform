import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campaign, CampaignAnalysisRequest, CampaignAnalysisResult, CampaignStatisticsResult } from '../models/marketing.model';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private base = '/api/campaigns';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.base);
  }

  getById(id: number): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.base}/${id}`);
  }

  create(campaign: Campaign): Observable<Campaign> {
    return this.http.post<Campaign>(this.base, campaign);
  }

  update(id: number, campaign: Campaign): Observable<Campaign> {
    return this.http.put<Campaign>(`${this.base}/${id}`, campaign);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  analyze(request: CampaignAnalysisRequest): Observable<CampaignAnalysisResult> {
    return this.http.post<CampaignAnalysisResult>(`${this.base}/analyze`, request);
  }

  getStatistics(): Observable<CampaignStatisticsResult> {
    return this.http.get<CampaignStatisticsResult>(`${this.base}/statistics`);
  }

  duplicate(id: number): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.base}/${id}/duplicate`, {});
  }
}
