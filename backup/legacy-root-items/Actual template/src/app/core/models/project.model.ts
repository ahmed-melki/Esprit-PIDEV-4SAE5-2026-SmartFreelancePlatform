import { User } from './user.model';

export interface Project {
  id?: number;
  title: string;
  description: string;
  budget: number;
  deadline?: string; // e.g. "2026-12-31" (LocalDate format)
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt?: string;
  client?: User;
}
