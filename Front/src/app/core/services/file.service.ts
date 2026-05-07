import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  /**
   * Upload a CV file to the backend.
   * Backend returns the download URL as plain text.
   */
  uploadCV(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload/cv`, formData, {
      responseType: 'text'
    });
  }
}
