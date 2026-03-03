// src/app/models/sponsorship-create.dto.ts
export interface SponsorshipCreateDTO {
  eventId: number;
  sponsorId?: number;
  sponsorFirstName: string;
  sponsorLastName: string;
  sponsorEmail: string;
  amount: number;
  contractStatus?: string;
  pdfUrl?: string;
}