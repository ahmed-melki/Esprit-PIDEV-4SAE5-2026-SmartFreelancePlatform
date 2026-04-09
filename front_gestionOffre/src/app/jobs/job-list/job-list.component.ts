
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { JobOfferService, JobOffer, ContractType, JobStatus } from '../../jobs/job-offer.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // ← AJOUTER
import { QuizDialogComponent } from '../quiz-dialog/quiz-dialog.component'; // ← AJOUTER
import { QuizService } from '../../quiz/quiz.service';

@Component({
  selector: 'app-job-list',
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
     MatDialogModule
  ],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  jobs: JobOffer[] = [];
  filteredJobs: JobOffer[] = [];
  loading = false;
  
  // Filtres
  searchText = '';
  selectedContractType = 'all';
  selectedStatus = 'all';
  minSalary = 0;
  maxSalary = 200000;
  remoteOnly = false;
  
  // Pagination
  pageSize = 6;
  currentPage = 0;
  pageSizeOptions = [6, 12, 18, 24];

  contractTypes = Object.values(ContractType);
  jobStatuses = Object.values(JobStatus);
  Math = Math;

  constructor(
    private jobService: JobOfferService,
    private quizService: QuizService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.jobService.getAll().subscribe({
      next: (data) => {
        this.jobs = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.showError('Impossible de charger les offres');
        this.loading = false;
      }
    });
  }

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

  get paginatedJobs(): JobOffer[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  deleteJob(id: number): void {
    if (confirm('Supprimer cette offre ?')) {
      this.jobService.delete(id).subscribe({
        next: () => {
          this.showSuccess('Offre supprimée avec succès');
          this.loadJobs();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.showError('Erreur lors de la suppression');
        }
      });
    }
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

  getContractTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'STAGE': 'Stage',
      'FREELANCE': 'Freelance'
    };
    return labels[type] || type;
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'OPEN': return '#4caf50';
      case 'CLOSED': return '#f44336';
      case 'DRAFT': return '#ff9800';
      default: return '#9e9e9e';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'OPEN': return 'Ouvert';
      case 'CLOSED': return 'Fermé';
      case 'DRAFT': return 'Brouillon';
      default: return status;
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
    // ✅ Méthode pour ouvrir le dialogue de création de quiz
  openQuizDialog(job: JobOffer): void {
  console.log('Ouverture dialogue pour job:', job);
  console.log('Job ID:', job.id);
  
  const dialogRef = this.dialog.open(QuizDialogComponent, {
    width: '800px',
    data: { job: job }  // ✅ Vérifier que job contient l'id
  });
}

}