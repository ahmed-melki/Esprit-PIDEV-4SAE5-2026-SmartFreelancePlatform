import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CandidatureService } from '../../candidatures/candidature.service';
import { JobOfferService, JobOffer } from '../../jobs/job-offer.service';
import { QuizService } from '../../quiz/quiz.service';

@Component({
  selector: 'app-candidature-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './candidature-form.component.html',
  styleUrls: ['./candidature-form.component.css']
})
export class CandidatureFormComponent implements OnInit {
  jobId: number = 0;
  candidatId: number = 1;
  lettreMotivation: string = '';
  cvUrl: string = '';
  cvFile: File | null = null;
  
  job: JobOffer | null = null;
  hasPassedQuiz: boolean = false;
  hasApplied: boolean = false;
  loading: boolean = false;
  quizCompleted: boolean = false;

  constructor(
    private candidatureService: CandidatureService,
    private quizService: QuizService,
    private jobService: JobOfferService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loadJob();
    this.verifierQuiz();
    this.verifierCandidature();
  }

  loadJob(): void {
    this.jobService.getById(this.jobId).subscribe({
      next: (data) => this.job = data,
      error: (err) => console.error('Erreur chargement job:', err)
    });
  }

  verifierQuiz(): void {
    this.quizService.hasUserPassedQuiz(this.jobId, this.candidatId).subscribe({
      next: (passed) => {
        this.hasPassedQuiz = passed;
        this.quizCompleted = true;
      },
      error: () => {
        this.hasPassedQuiz = false;
        this.quizCompleted = true;
      }
    });
  }

  verifierCandidature(): void {
    this.candidatureService.getCandidaturesByCandidat(this.candidatId).subscribe({
      next: (candidatures) => {
        this.hasApplied = candidatures.some(c => c.jobOffer.id === this.jobId);
      }
    });
  }

  onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.cvFile = file;
    this.cvUrl = `https://storage.com/cvs/${file.name}`;  
  }}

  postuler(): void {
    if (!this.lettreMotivation || this.lettreMotivation.length < 50) {
      this.snackBar.open('Veuillez écrire une lettre de motivation (minimum 50 caractères)', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading = true;
    
    this.candidatureService.postuler(this.jobId, this.candidatId, this.lettreMotivation, this.cvUrl)
      .subscribe({
        next: () => {
          this.snackBar.open('✅ Candidature envoyée avec succès !', 'Fermer', { duration: 5000 });
          this.router.navigate(['/mes-candidatures']);
        },
        error: (err) => {
          let message = 'Erreur lors de l\'envoi de la candidature';
          if (err.error?.message) {
            message = err.error.message;
          }
          this.snackBar.open('❌ ' + message, 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  goToQuiz(): void {
    this.router.navigate(['/quiz', this.jobId]);
  }

  annuler(): void {
    this.router.navigate(['/jobs', this.jobId]);
  }

  voirStatut(): void {
    this.router.navigate(['/mes-candidatures']);
  }
}