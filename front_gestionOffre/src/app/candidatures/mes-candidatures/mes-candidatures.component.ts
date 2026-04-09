import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { CandidatureService, Candidature, StatutCandidature } from '../../candidatures/candidature.service';

@Component({
  selector: 'app-mes-candidatures',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './mes-candidatures.component.html',
  styleUrls: ['./mes-candidatures.component.css']
})
export class MesCandidaturesComponent implements OnInit {
  candidatures: Candidature[] = [];
  loading = false;
  candidatId: number = 1;

  constructor(private candidatureService: CandidatureService) {}

  ngOnInit(): void {
    this.loadCandidatures();
  }

  loadCandidatures(): void {
    this.loading = true;
    this.candidatureService.getCandidaturesByCandidat(this.candidatId).subscribe({
      next: (data) => {
        this.candidatures = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.loading = false;
      }
    });
  }

  getStatutLabel(statut: StatutCandidature): string {
    return this.candidatureService.getStatutLabel(statut);
  }

  getStatutClass(statut: StatutCandidature): string {
    return this.candidatureService.getStatutClass(statut);
  }

  getStatutIcon(statut: StatutCandidature): string {
    return this.candidatureService.getStatutIcon(statut);
  }

  get filteredCandidatures(): Candidature[] {
    return this.candidatures;
  }
}