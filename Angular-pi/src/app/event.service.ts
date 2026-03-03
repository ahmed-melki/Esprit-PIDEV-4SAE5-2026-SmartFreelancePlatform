import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from './event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl = 'http://localhost:8081/pi/api/events';
  private uploadUrl = 'http://localhost:8081/pi/api/upload'; // URL pour l'upload
 
    getEventById: any;

  constructor(private http: HttpClient) {}

  /** Récupérer tous les événements */
  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  /** Récupérer un événement par ID */
  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  /** Créer un nouvel événement */
  create(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /** Mettre à jour un événement */
  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  /** Supprimer un événement */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Upload photo pour événement */
  uploadPhoto(formData: FormData): Observable<any> {
    return this.http.post<any>(this.uploadUrl, formData);
  }

  /** Créer un événement avec fichier */
  createWithFile(formData: FormData): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, formData);
  }


  
  


  

}
