import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SponsorshipDTO } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class SponsorshipService {
  private base = '/pi/api/sponsorships';

  constructor(private http: HttpClient) {}

  getAll(): Observable<SponsorshipDTO[]> {
    return this.http.get<SponsorshipDTO[]>(this.base);
  }

  getById(id: number): Observable<SponsorshipDTO> {
    return this.http.get<SponsorshipDTO>(`${this.base}/${id}`);
  }

  create(dto: SponsorshipDTO): Observable<SponsorshipDTO> {
    return this.http.post<SponsorshipDTO>(this.base, dto);
  }

  signContract(id: number): Observable<SponsorshipDTO> {
    return this.http.post<SponsorshipDTO>(`${this.base}/${id}/sign`, {});
  }

  getPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/pdf`, { responseType: 'blob' });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
