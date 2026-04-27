import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ProjectService } from '../../../core/services/project.service';
import { JobOffer } from '../../../core/models/job.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-freelancer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './freelancer-dashboard.component.html',
  styleUrl: './freelancer-dashboard.component.css'
})
export class FreelancerDashboardComponent implements OnInit {
  jobs: JobOffer[] = [];
  projects: Project[] = [];
  isLoadingProjects = true;
  projectError = false;

  readonly freelancerSkills: string[] = ['Angular', 'economie', 'marketing', 'design', 'Java'];

  // Pagination
  jobsPage = 1;
  projectsPage = 1;
  pageSize = 4;
  Math = Math;

  get paginatedJobs(): JobOffer[] {
    const start = (this.jobsPage - 1) * this.pageSize;
    return this.jobs.slice(start, start + this.pageSize);
  }

  get paginatedProjects(): Project[] {
    const start = (this.projectsPage - 1) * this.pageSize;
    return this.projects.slice(start, start + this.pageSize);
  }

  get totalJobPages(): number {
    return Math.ceil(this.jobs.length / this.pageSize);
  }

  get totalProjectPages(): number {
    return Math.ceil(this.projects.length / this.pageSize);
  }

  constructor(
    private jobService: JobService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    // Fetch open jobs from backend
    this.jobService.getOpenJobs().subscribe({
      next: (data) => this.jobs = data,
      error: (err) => console.warn('Jobs backend unavailable', err)
    });

    this.projectService.getProjects().subscribe({
      next: (allProjects) => {
        this.projects = this.matchProjects(allProjects);
        this.isLoadingProjects = false;
      },
      error: (err) => {
        console.warn('Backend unavailable, no projects loaded.', err);
        this.projectError = true;
        this.isLoadingProjects = false;
      }
    });
  }

  /**
   * Replicates the backend matching algorithm exactly:
   * 1. Keep only projects with status OPEN
   * 2. Split each skill by whitespace → get individual tokens
   * 3. A project matches if ANY single token appears in title OR description (case-insensitive)
   */
  private matchProjects(projects: Project[]): Project[] {
    const openProjects = projects.filter(p => p.status === 'OPEN');

    return openProjects.filter(project => {
      const title = (project.title ?? '').toLowerCase();
      const description = (project.description ?? '').toLowerCase();

      return this.freelancerSkills.some(skill =>
        skill.split(' ').some(token =>
          title.includes(token.toLowerCase()) ||
          description.includes(token.toLowerCase())
        )
      );
    });
  }
}
