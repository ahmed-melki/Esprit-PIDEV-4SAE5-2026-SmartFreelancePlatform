import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ========== ENUMS ET INTERFACE ==========
export enum ContractType {
  CDI = 'CDI',
  CDD = 'CDD',
  STAGE = 'STAGE',
  FREELANCE = 'FREELANCE'
}

export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT'
}

export interface JobOffer {
  id?: number;
  title: string;
  description: string;
  company: string;
  location: string;
  contractType: ContractType;
  salaryMin: number;
  salaryMax: number;
  requiredSkills: string[];
  experienceLevel: string;
  educationLevel: string;
  deadline: string;
  numberOfPositions: number;
  status: JobStatus;
  remotePossible: boolean;
  benefits: string;
  createdAt?: string;
  updatedAt?: string;
  employerId?: number;
  applicantIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class JobOfferService {
  private apiUrl = 'http://localhost:8052/api/jobs';

  constructor(private http: HttpClient) { }

  // ========== CRUD ==========
  getAll(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(this.apiUrl);
  }

  getById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`);
  }

  create(jobOffer: JobOffer): Observable<JobOffer> {
    return this.http.post<JobOffer>(this.apiUrl, jobOffer);
  }

  update(id: number, jobOffer: JobOffer): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.apiUrl}/${id}`, jobOffer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ========== FONCTIONNALITÉS AVANCÉES ==========
  getByContractType(type: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/contract/${type}`);
  }

  getByStatus(status: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/status/${status}`);
  }

  getByCompany(company: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/company/${company}`);
  }

  search(keyword: string): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  getBySalaryRange(min: number, max: number): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/salary?min=${min}&max=${max}`);
  }

  getOpenJobs(): Observable<JobOffer[]> {
    return this.http.get<JobOffer[]>(`${this.apiUrl}/open`);
  }
}