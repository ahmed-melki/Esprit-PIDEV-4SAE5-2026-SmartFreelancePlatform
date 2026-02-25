// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'CLIENT' | 'FREELANCER' | 'ADMIN';
  skills?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // ✅ MÉTHODE getCurrentUser() AJOUTÉE
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // À appeler après login
  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  isClient(): boolean {
    return this.currentUserSubject.value?.role === 'CLIENT';
  }

  isFreelancer(): boolean {
    return this.currentUserSubject.value?.role === 'FREELANCER';
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}