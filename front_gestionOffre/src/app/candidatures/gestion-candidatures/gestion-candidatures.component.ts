// src/app/candidatures/gestion-candidatures/gestion-candidatures.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CandidatureService, Candidature, StatutCandidature } from '../candidature.service';

@Component({
  selector: 'app-gestion-candidatures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './gestion-candidatures.component.html',
  styleUrls: ['./gestion-candidatures.component.css']
})
export class GestionCandidaturesComponent implements OnInit {
  candidatures: Candidature[] = [];
  stats: any = {};
  loading = false;
  downloading = false;
  jobId: number = 0;
  statusOptions = Object.values(StatutCandidature);

  constructor(
    private candidatureService: CandidatureService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    if (this.jobId) {
      this.loadCandidatures();
      this.loadStats();
    } else {
      this.snackBar.open('Offre non trouvée', 'Fermer', { duration: 3000 });
      this.router.navigate(['/jobs']);
    }
  }

  loadCandidatures(): void {
    this.loading = true;
    this.candidatureService.getCandidaturesByJob(this.jobId).subscribe({
      next: (data: Candidature[]) => {
        this.candidatures = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.snackBar.open('Erreur lors du chargement des candidatures', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.candidatureService.getStatsByJob(this.jobId).subscribe({
      next: (stats: any) => {
        this.stats = stats;
      },
      error: (err: any) => {
        console.error('Erreur chargement stats:', err);
      }
    });
  }

  updateStatut(candidature: Candidature, nouveauStatut: string): void {
    this.candidatureService.updateStatut(candidature.id, nouveauStatut, '').subscribe({
      next: () => {
        candidature.statut = nouveauStatut as StatutCandidature;
        this.snackBar.open('Statut mis à jour', 'Fermer', { duration: 3000 });
        this.loadStats();
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Télécharger le CV
  downloadCV(cvUrl: string, candidatId: number): void {
  if (!cvUrl) {
    this.snackBar.open('Aucun CV disponible', 'Fermer', { duration: 3000 });
    return;
  }
  
  this.downloading = true;
  
  this.candidatureService.downloadCV(cvUrl).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_Candidat_${candidatId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      this.downloading = false;
      this.snackBar.open('Téléchargement du CV démarré', 'Fermer', { duration: 3000 });
    },
    error: (err: any) => {
      console.error('Erreur téléchargement:', err);
      this.snackBar.open('Erreur lors du téléchargement du CV', 'Fermer', { duration: 3000 });
      this.downloading = false;
    }
  });
}

  viewCV(cvUrl: string): void {
  if (!cvUrl) {
    this.snackBar.open('Aucun CV disponible', 'Fermer', { duration: 3000 });
    return;
  }
  
  // Ouvrir le CV dans un nouvel onglet
  window.open(cvUrl, '_blank');
}

  getStatutLabel(statut: StatutCandidature): string {
    return this.candidatureService.getStatutLabel(statut);
  }

  getStatutClass(statut: StatutCandidature): string {
    return this.candidatureService.getStatutClass(statut);
  }

  planifierEntretien(candidature: Candidature): void {
    this.snackBar.open(`📅 Planifier un entretien pour le candidat #${candidature.candidatId}`, 'Fermer', { duration: 3000 });
  }
}