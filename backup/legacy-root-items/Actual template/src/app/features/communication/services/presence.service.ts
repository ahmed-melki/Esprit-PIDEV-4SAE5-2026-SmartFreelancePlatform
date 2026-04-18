import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Presence } from '../models/presence.model';

@Injectable({ providedIn: 'root' })
export class PresenceService implements OnDestroy {
  private base = '/presence';
  private heartbeatInterval?: ReturnType<typeof setInterval>;
  private consecutiveFailures = 0;
  private readonly MAX_FAILURES = 3;

  constructor(private http: HttpClient) {}

  startHeartbeat(userId?: number): void {
    const defaultId = userId || 1;
    this.stopHeartbeat();
    this.consecutiveFailures = 0;
    this.heartbeat(defaultId);
    this.heartbeatInterval = setInterval(() => this.heartbeat(defaultId), 30000);
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private heartbeat(userId: number): void {
    this.http.post<void>(`${this.base}/heartbeat?userId=${userId}`, {}).pipe(
      tap(() => {
        this.consecutiveFailures = 0; // Reset on success
      }),
      catchError(err => {
        this.consecutiveFailures++;
        console.warn(`Heartbeat failure (${this.consecutiveFailures}/${this.MAX_FAILURES})`);
        if (this.consecutiveFailures >= this.MAX_FAILURES) {
          console.error('Max heartbeat failures reached. Stopping heartbeat.');
          this.stopHeartbeat();
        }
        return of(null); // Silently swallow error
      })
    ).subscribe();
  }

  getPresence(userId: number): Observable<Presence> {
    return this.http.get<Presence>(`${this.base}/${userId}`).pipe(
      catchError(() => of({ online: false, lastSeen: undefined } as Presence))
    );
  }

  ngOnDestroy(): void {
    this.stopHeartbeat();
  }
}
