import { Injectable } from '@angular/core';

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  role: 'CLIENT' | 'FREELANCER';
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  readonly currentUser: User = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    role: 'FREELANCER'
  };

  getCurrentUserId(): number {
    return this.currentUser.id;
  }
}
