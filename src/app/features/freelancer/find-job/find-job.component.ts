import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { JobOffer } from '../../../core/models/job.model';

@Component({
  selector: 'app-find-job',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './find-job.component.html',
  styleUrl: './find-job.component.css'
})
export class FindJobComponent implements OnInit {
  jobs: JobOffer[] = [];
  isLoading = true;
  error = false;

  // Pagination & Filtering
  pageSize = 6;
  currentPage = 1;
  searchTerm = '';
  Math = Math;

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.isLoading = true;
    this.jobService.getOpenJobs().subscribe({
      next: (data) => {
        this.jobs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  get filteredJobs(): JobOffer[] {
    return this.jobs.filter(j => 
      (j.title?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) ?? false) ||
      (j.description?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) ?? false) ||
      (j.company?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) ?? false)
    );
  }

  get paginatedJobs(): JobOffer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredJobs.length / this.pageSize);
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
  }
}
