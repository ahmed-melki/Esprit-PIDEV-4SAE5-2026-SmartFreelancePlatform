import { Injectable } from '@angular/core';
import { DemoAuthService } from './demo-auth.service';

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  role: 'CLIENT' | 'FREELANCER';
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  constructor(private demoAuthService: DemoAuthService) {}

  get currentUser(): User {
    const role = this.demoAuthService.getRole();
    const userId = this.demoAuthService.getUserId();

    return {
      id: userId,
      firstName: role === 'ADMIN' ? 'Admin' : 'Demo',
      lastName: 'User',
      role: role === 'ADMIN' ? 'CLIENT' : 'FREELANCER',
    };
  }

  getCurrentUserId(): number {
    return this.currentUser.id;
  }
}
