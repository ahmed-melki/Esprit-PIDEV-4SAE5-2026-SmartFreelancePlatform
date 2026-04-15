import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'FREELANCER' | 'CLIENT';
  emailVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8082/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Restaurer l'utilisateur depuis localStorage au démarrage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, userData);
  }

  /**
   * Connexion
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        // Construire l'objet utilisateur à partir de la réponse
        const user: User = {
          id: response.id,
          email: response.email,
          role: response.role,
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          emailVerified: response.emailVerified ?? true
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Récupère l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Retourne les rôles de l'utilisateur (pour compatibilité avec votre code existant)
   */
  getUserRoles(): string[] {
    const user = this.getCurrentUser();
    return user ? [user.role] : [];
  }

  /**
   * Vérifie si l'utilisateur possède un rôle donné
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Redirection après connexion selon le rôle
   */
  redirectAfterLogin(): void {
    const user = this.getCurrentUser();
    if (!user) return;
    switch (user.role) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'FREELANCER':
        this.router.navigate(['/freelancer']);
        break;
      case 'CLIENT':
        this.router.navigate(['/client']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}