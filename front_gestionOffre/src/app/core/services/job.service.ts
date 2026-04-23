import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobOffer } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:8052/api/jobs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(this.apiUrl);
  }

  getOpenJobs(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/open`);
  }

  getById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`);
  }

  create(job: JobOffer): Observable<JobOffer> {
    return this.http.post<JobOffer>(this.apiUrl, job);
  }

  update(id: number, job: JobOffer): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.apiUrl}/${id}`, job);
  }

  updatePartial(id: number, updates: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}`, updates);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getByContractType(type: 'CDI' | 'CDD' | 'STAGE' | 'FREELANCE'): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/contract/${type}`);
  }

  getByStatus(status: 'OPEN' | 'CLOSED' | 'DRAFT'): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/status/${status}`);
  }

  getByCompany(company: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/company/${company}`);
  }

  getBySalaryRange(min: number, max: number): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/salary?min=${min}&max=${max}`);
  }

  search(keyword: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }
}
