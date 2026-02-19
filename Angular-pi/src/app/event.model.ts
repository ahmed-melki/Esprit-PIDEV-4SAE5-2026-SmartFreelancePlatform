export interface Event {
  id?: number;
  title: string;
  description?: string;
  photoUrl?: string;
  category?: string;
  type: 'HACKATHON' | 'WORKSHOP' | 'MEETUP' | 'WEBINAR';
  startDate: string;
  endDate: string;
  location?: string;
  price?: number;
}
