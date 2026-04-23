export enum EventType {
  HACKATHON = 'HACKATHON',
  WORKSHOP = 'WORKSHOP',
  MEETUP = 'MEETUP',
  WEBINAR = 'WEBINAR',
  BOOTCAMP = 'BOOTCAMP',
  CHALLENGE = 'CHALLENGE',
  PITCH_EVENT = 'PITCH_EVENT',
  MENTORING_SESSION = 'MENTORING_SESSION',
  EXPO = 'EXPO',
  SOCIAL_EVENT = 'SOCIAL_EVENT'
}

export enum ReactionType {
  VERY_INTERESTED = 'VERY_INTERESTED',
  INTERESTED = 'INTERESTED',
  MAYBE = 'MAYBE',
  NOT_INTERESTED = 'NOT_INTERESTED'
}

export interface Event {
  id?: number;
  title: string;
  description: string;
  photoUrl?: string;
  category: string;
  type: EventType;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  location: string;
  price: number;
}

export interface SponsorshipDTO {
  id?: number;
  eventId: number;
  sponsorId?: number;
  amount: number;
  contractStatus?: string;
  pdfUrl?: string;
  dateCreated?: string;
  sponsorFirstName: string;
  sponsorLastName: string;
  sponsorEmail: string;
}

export interface ReactionStats {
  [key: string]: number;
}
