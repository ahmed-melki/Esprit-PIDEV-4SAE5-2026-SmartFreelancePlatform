export interface User {
  id?: number;
  name?: string;
  email?: string;
  role?: 'CLIENT' | 'FREELANCER';
  skills?: string[];
}
