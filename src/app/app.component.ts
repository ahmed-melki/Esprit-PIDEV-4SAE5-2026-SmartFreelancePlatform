import { Component, OnDestroy, OnInit, AfterViewInit, inject } from '@angular/core';
import { PresenceService, PreloaderService, SettingsService } from '@core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly preloader = inject(PreloaderService);
  private readonly settings = inject(SettingsService);
  private readonly presenceService = inject(PresenceService);

  private readonly currentUserId = 1;
  private heartbeatIntervalId: ReturnType<typeof setInterval> | undefined;

  ngOnInit() {
    this.settings.setDirection();
    this.settings.setTheme();

    // TEMP: désactive le heartbeat tant que l'endpoint backend renvoie 500.
    // Réactiver quand le backend presence/heartbeat est stable.
    const enableHeartbeat = false;
    if (!enableHeartbeat) return;

    const sendHeartbeat = () => {
      this.presenceService.heartbeat(this.currentUserId).subscribe({
        next: () => {},
        error: () => {},
      });
    };

    sendHeartbeat();
    this.heartbeatIntervalId = setInterval(sendHeartbeat, 30_000);
  }

  ngAfterViewInit() {
    this.preloader.hide();
  }

  ngOnDestroy(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = undefined;
    }
  }
}
