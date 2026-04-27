import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidatureService } from '../../../core/services/candidature.service';
import { JobService } from '../../../core/services/job.service';
import { Candidature } from '../../../core/models/candidature.model';
import { JobOffer } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-applicants',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './job-applicants.component.html',
  styleUrl: './job-applicants.component.css'
})
export class JobApplicantsComponent implements OnInit {
  jobId!: number;
  job: JobOffer | null = null;
  candidatures: Candidature[] = [];
  filteredCandidatures: Candidature[] = [];
  isLoading = true;
  errorMsg = '';

  // Filters
  searchTerm = '';
  statusFilter = 'ALL';

  // Pagination
  currentPage = 1;
  pageSize = 5;
  Math = Math;

  get paginatedApplicants(): Candidature[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCandidatures.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCandidatures.length / this.pageSize);
  }

  // Status options for the dropdown
  statusOptions = [
    { value: 'EN_ATTENTE', label: 'Pending', icon: 'hourglass_top', color: 'status-pending' },
    { value: 'EN_COURS_EXAMEN', label: 'Under Review', icon: 'visibility', color: 'status-review' },
    { value: 'ENTRETIEN_PLANIFIE', label: 'Interview Scheduled', icon: 'event', color: 'status-interview' },
    { value: 'ENTRETIEN_REALISE', label: 'Interview Done', icon: 'fact_check', color: 'status-done' },
    { value: 'ACCEPTEE', label: 'Accepted', icon: 'check_circle', color: 'status-accepted' },
    { value: 'REFUSEE', label: 'Rejected', icon: 'cancel', color: 'status-rejected' }
  ];

  constructor(
    private route: ActivatedRoute,
    private candidatureService: CandidatureService,
    private jobService: JobService
  ) {}

  ngOnInit(): void {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));

    // Load job details
    this.jobService.getById(this.jobId).subscribe({
      next: (job) => this.job = job,
      error: (err) => console.error('Could not load job', err)
    });

    // Load candidatures for this job
    this.candidatureService.getCandidaturesByJob(this.jobId).subscribe({
      next: (data) => {
        this.candidatures = data;
        this.filteredCandidatures = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'Could not load applicants. Make sure the backend is running.';
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.filteredCandidatures = this.candidatures.filter(c => {
      const matchesStatus = this.statusFilter === 'ALL' || c.statut === this.statusFilter;
      const matchesSearch = !this.searchTerm ||
        (c.candidatId?.toString().includes(this.searchTerm)) ||
        (c.lettreMotivation?.toLowerCase().includes(this.searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  getStatusOption(statut: string | undefined) {
    return this.statusOptions.find(s => s.value === statut) || this.statusOptions[0];
  }

  updateStatus(candidature: Candidature, newStatus: string): void {
    this.candidatureService.updateStatus(candidature.id!, newStatus).subscribe({
      next: (updated) => {
        candidature.statut = updated.statut;
      },
      error: (err) => {
        console.error('Failed to update status', err);
      }
    });
  }

  downloadCV(cvUrl: string): void {
    window.open(cvUrl, '_blank');
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  get pendingCount(): number {
    return this.candidatures.filter(c => c.statut === 'EN_ATTENTE').length;
  }

  get reviewCount(): number {
    return this.candidatures.filter(c => c.statut === 'EN_COURS_EXAMEN').length;
  }

  get acceptedCount(): number {
    return this.candidatures.filter(c => c.statut === 'ACCEPTEE').length;
  }
}
