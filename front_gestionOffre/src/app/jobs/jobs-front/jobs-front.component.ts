// src/app/features/freelancer/jobs-front/jobs-front.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Services
import { JobOfferService, JobOffer, ContractType, JobStatus } from '../../jobs/job-offer.service';
import { QuizService } from '../../quiz/quiz.service';
import { CandidatureService } from '../../candidatures/candidature.service';

// Composant du dialogue
import { CandidatureDialogComponent } from '../../candidatures/candidature-dialog/candidature-dialog.component';

@Component({
  selector: 'app-jobs-front',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './jobs-front.component.html',
  styleUrls: ['./jobs-front.component.css']
})
export class JobsFrontComponent implements OnInit {
  jobs: JobOffer[] = [];
  filteredJobs: JobOffer[] = [];
  loading = false;
  userId: number = 1; // ID du candidat connecté (à remplacer par l'ID réel)
  
  // Filtres
  searchText = '';
  selectedContractType = 'all';
  selectedStatus = 'all';
  minSalary = 0;
  maxSalary = 200000;
  remoteOnly = false;
  
  // Pagination
  pageSize = 9;
  currentPage = 0;
  pageSizeOptions = [6, 9, 12, 18, 24];
  
  contractTypes = Object.values(ContractType);
  jobStatuses = Object.values(JobStatus);
  Math = Math;
  
  // Maps pour les quizzes
  quizIdMap: Map<number, number> = new Map();
  quizPassedMap: Map<number, boolean> = new Map();
  loadingQuizzes: boolean = true;

  constructor(
    private jobService: JobOfferService,
    private quizService: QuizService,
    private candidatureService: CandidatureService,
    private router: Router,
    private dialog: MatDialog,  // ✅ AJOUTER MatDialog
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  // ========== CHARGEMENT DES DONNÉES ==========
  
  loadJobs(): void {
    this.loading = true;
    this.loadingQuizzes = true;
    
    this.jobService.getAll().subscribe({
      next: (data) => {
        this.jobs = data.filter(job => job.status === 'OPEN');
        this.filteredJobs = this.jobs;
        console.log('Jobs chargés:', this.jobs.length);
        
        this.checkQuizzesForJobs();
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.snackBar.open('Erreur lors du chargement des offres', 'Fermer', { duration: 3000 });
        this.loading = false;
        this.loadingQuizzes = false;
      }
    });
  }

  // Vérifier les quizzes pour toutes les offres
  checkQuizzesForJobs(): void {
    let completedRequests = 0;
    const totalJobs = this.jobs.length;
    
    if (totalJobs === 0) {
      this.loadingQuizzes = false;
      return;
    }
    
    this.jobs.forEach(job => {
      this.quizService.getQuizzesByJob(job.id!).subscribe({
        next: (quizzes) => {
          if (quizzes && quizzes.length > 0) {
            const quizId = quizzes[0].id!;
            this.quizIdMap.set(job.id!, quizId);
            console.log(`✅ Quiz trouvé pour job ${job.id} (quizId: ${quizId})`);
            
            // Vérifier si l'utilisateur a réussi ce quiz
            this.quizService.hasUserPassedQuiz(job.id!, this.userId).subscribe({
              next: (passed) => {
                this.quizPassedMap.set(job.id!, passed);
                console.log(`📊 Job ${job.id} - Quiz réussi: ${passed}`);
                this.cdr.detectChanges();
              },
              error: () => {
                this.quizPassedMap.set(job.id!, false);
              }
            });
          } else {
            console.log(`❌ Pas de quiz pour job ${job.id}`);
          }
          completedRequests++;
          if (completedRequests === totalJobs) {
            this.loadingQuizzes = false;
            this.cdr.detectChanges();
            console.log('Vérification des quizzes terminée');
          }
        },
        error: (err) => {
          console.error(`Erreur pour job ${job.id}:`, err);
          completedRequests++;
          if (completedRequests === totalJobs) {
            this.loadingQuizzes = false;
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  // Vérifier si un job a un quiz
  hasQuiz(jobId: number): boolean {
    return this.quizIdMap.has(jobId);
  }

  // Récupérer l'ID du quiz
  getQuizId(jobId: number): number {
    return this.quizIdMap.get(jobId) || 0;
  }

  // Vérifier si l'utilisateur a réussi le quiz pour ce job
  hasPassedQuiz(jobId: number): boolean {
    return this.quizPassedMap.get(jobId) || false;
  }

  // ========== POSTULATION ==========
  
  // Postuler à une offre (reçoit l'objet job complet)
  applyToJob(job: JobOffer): void {
    // Vérifier d'abord si l'utilisateur a réussi le quiz
    this.quizService.hasUserPassedQuiz(job.id!, this.userId).subscribe({
      next: (passed) => {
        if (!passed) {
          // Proposer de passer le quiz
          this.snackBar.open('Vous devez réussir le quiz avant de postuler', 'Passer le quiz', { duration: 5000 })
            .onAction().subscribe(() => {
              const quizId = this.getQuizId(job.id!);
              if (quizId) {
                this.router.navigate(['/quiz', quizId]);
              }
            });
          return;
        }
        
        // Ouvrir le dialogue moderne de candidature
        this.openCandidatureDialog(job);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.snackBar.open('Erreur lors de la vérification', 'Fermer', { duration: 3000 });
      }
    });
  }

  // ✅ Ouvrir le dialogue moderne de candidature
  openCandidatureDialog(job: JobOffer): void {
    const dialogRef = this.dialog.open(CandidatureDialogComponent, {
      width: '600px',
      data: {
        job: job,
        userId: this.userId
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Candidature envoyée avec succès');
        // Optionnel: rafraîchir la liste ou afficher un message
      }
    });
  }

  // ========== FILTRES ==========
  
  applyFilters(): void {
    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch = this.searchText === '' ||
        job.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        job.description.toLowerCase().includes(this.searchText.toLowerCase()) ||
        job.company.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesContract = this.selectedContractType === 'all' ||
        job.contractType === this.selectedContractType;

      const matchesStatus = this.selectedStatus === 'all' ||
        job.status === this.selectedStatus;

      const matchesSalary = job.salaryMin >= this.minSalary &&
        job.salaryMax <= this.maxSalary;

      const matchesRemote = !this.remoteOnly || job.remotePossible;

      return matchesSearch && matchesContract && matchesStatus && matchesSalary && matchesRemote;
    });
    
    this.currentPage = 0;
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedContractType = 'all';
    this.selectedStatus = 'all';
    this.minSalary = 0;
    this.maxSalary = 200000;
    this.remoteOnly = false;
    this.applyFilters();
  }

  // ========== PAGINATION ==========
  
  get paginatedJobs(): JobOffer[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ========== MÉTHODES UTILITAIRES ==========
  
  getContractTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'STAGE': 'Stage',
      'FREELANCE': 'Freelance'
    };
    return labels[type] || type;
  }

  getDaysLeft(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isUrgent(deadline: string): boolean {
    const daysLeft = this.getDaysLeft(deadline);
    return daysLeft <= 7 && daysLeft >= 0;
  }
}