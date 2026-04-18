import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ProjectService } from '../../../core/services/project.service';
import { JobOffer } from '../../../core/models/job.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  myJobs: JobOffer[] = [];
  myProjects: Project[] = [];

  // Pagination
  jobsPage = 1;
  projectsPage = 1;
  pageSize = 6;
  Math = Math;

  get paginatedJobs(): JobOffer[] {
    const start = (this.jobsPage - 1) * this.pageSize;
    return this.myJobs.slice(start, start + this.pageSize);
  }

  get paginatedProjects(): Project[] {
    const start = (this.projectsPage - 1) * this.pageSize;
    return this.myProjects.slice(start, start + this.pageSize);
  }

  get totalJobPages(): number {
    return Math.ceil(this.myJobs.length / this.pageSize);
  }

  get totalProjectPages(): number {
    return Math.ceil(this.myProjects.length / this.pageSize);
  }

  constructor(
    private jobService: JobService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.jobService.getAll().subscribe({
      next: (data) => {
        this.myJobs = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.warn('Jobs backend unavailable', err);
        this.myJobs = [];
      }
    });

    this.projectService.getProjects().subscribe({
      next: (data) => {
        // Handle potential wrapping from backend (e.g. { projects: [...] })
        if (Array.isArray(data)) {
          this.myProjects = data;
        } else if (data && typeof data === 'object' && (data as any).projects) {
          this.myProjects = (data as any).projects;
        } else {
          console.warn('Unexpected project data format:', data);
          this.myProjects = [];
        }
      },
      error: (err) => {
        console.warn('Projects backend unavailable or error:', err);
        this.myProjects = [];
      }
    });
  }
}
