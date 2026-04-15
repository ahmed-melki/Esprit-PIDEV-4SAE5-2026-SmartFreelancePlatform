import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  // ← AJOUTÉ pour la transformation
import { User, UserCreate, UserUpdate, UserRole, UserStatus } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private apiUrl = 'http://localhost:8082/api/users';  // ← Ton backend Spring Boot

  constructor(private http: HttpClient) { }

  // ========== CREATE ==========
  createUser(user: UserCreate): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  // ========== READ ==========
  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        // Si la réponse a une propriété "content" (format paginé)
        if (response && response.content) {
          return response.content;
        }
        // Sinon, on suppose que c'est déjà un tableau
        return response;
      })
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/email/${email}`);
  }

  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  searchUsers(keyword: string): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/search?keyword=${keyword}`).pipe(
      map(response => {
        if (response && response.content) {
          return response.content;
        }
        return response;
      })
    );
  }

  // ========== UPDATE ==========
  updateUser(id: number, user: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  updateUserStatus(id: number, status: UserStatus): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  // ========== DELETE ==========
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  softDeleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/soft`);
  }

  // ========== STATS ==========
  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}