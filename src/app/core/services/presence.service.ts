import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PresenceStatus {
  online: boolean;
  lastSeen: string;
}

@Injectable({ providedIn: 'root' })
export class PresenceService {
  private apiUrl = '/api/communication/presence';

  constructor(private http: HttpClient) {}

  private coerceBoolean(value: unknown): boolean {
    if (value === true) return true;
    if (value === false) return false;
    if (value == null) return false;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true' || v === '1' || v === 'yes' || v === 'y') return true;
      if (v === 'false' || v === '0' || v === 'no' || v === 'n' || v === '') return false;
    }
    return Boolean(value);
  }

  private normalizeOptionalIsoString(value: unknown): string {
    if (value == null) return '';
    const s = String(value).trim();
    if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return '';
    return s;
  }

  heartbeat(userId: number): Observable<void> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.post<void>(`${this.apiUrl}/heartbeat`, null, { params });
  }

  getPresence(userId: number): Observable<PresenceStatus> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/${userId}`).pipe(
      map((p) => {
        const any = (p ?? {}) as Record<string, unknown>;
        return {
          online: this.coerceBoolean(any.online),
          lastSeen: this.normalizeOptionalIsoString(any.lastSeen ?? any.last_seen),
        } as PresenceStatus;
      })
    );
  }
}
