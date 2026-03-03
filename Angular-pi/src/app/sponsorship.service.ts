import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SponsorshipCreateDTO } from "../sponsorship-create.dto";

export interface SponsorshipDTO {
  id?: number;
  eventId: number;
  sponsorId: number;
  sponsorFirstName: string;
  sponsorLastName: string;
  sponsorEmail: string;
  amount: number;
  contractStatus: string;
  pdfUrl?: string;
  dateCreated?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SponsorshipService {

  private baseUrl = 'http://localhost:8081/pi/api/sponsorships';

  constructor(private http: HttpClient) {}

  /** Créer un nouveau sponsor */
 create(sponsorship: SponsorshipCreateDTO): Observable<SponsorshipDTO> {
  return this.http.post<SponsorshipDTO>(this.baseUrl, sponsorship, {
    headers: { 'Content-Type': 'application/json' }
  });
}

  /** Récupérer un sponsor par ID */
  getById(id: number): Observable<SponsorshipDTO> {
    return this.http.get<SponsorshipDTO>(`${this.baseUrl}/${id}`);
  }

  /** Signer un contrat de sponsor */
  signContract(id: number): Observable<SponsorshipDTO> {
    return this.http.post<SponsorshipDTO>(`${this.baseUrl}/${id}/sign`, {});
  }

  /** Générer le PDF du contrat */
  getPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}