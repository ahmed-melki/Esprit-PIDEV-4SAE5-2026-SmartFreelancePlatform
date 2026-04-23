import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { ProjectService } from '../../../core/services/project.service';
import { JobOffer } from '../../../core/models/job.model';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  myJobs: JobOffer[] = [];
  myProjects: Project[] = [];
  editJobForm: FormGroup;
  editingJobId: number | null = null;
  isSavingJob = false;
  jobActionError = '';
  editProjectForm: FormGroup;
  editingProjectId: number | null = null;
  isSavingProject = false;
  projectActionError = '';

  // Pagination
  jobsPage = 1;
  projectsPage = 1;
  pageSize = 6;
  Math = Math;

  get visibleJobs(): JobOffer[] {
    return this.myJobs.filter((job) => job.status !== 'CLOSED');
  }

  get openJobsCount(): number {
    return this.myJobs.filter((j) => j.status === 'OPEN').length;
  }

  get closedJobsCount(): number {
    return this.myJobs.filter((j) => j.status === 'CLOSED').length;
  }

  get draftJobsCount(): number {
    return this.myJobs.filter((j) => j.status === 'DRAFT').length;
  }

  get openProjectsCount(): number {
    return this.myProjects.filter((p) => p.status === 'OPEN').length;
  }

  get inProgressProjectsCount(): number {
    return this.myProjects.filter((p) => p.status === 'IN_PROGRESS').length;
  }

  get closedProjectsCount(): number {
    return this.myProjects.filter((p) => p.status === 'CLOSED').length;
  }

  get averageSalary(): number {
    const values = this.myJobs
      .map((job) => {
        const min = job.salaryMin ?? 0;
        const max = job.salaryMax ?? 0;
        return min > 0 || max > 0 ? (min + max) / 2 : 0;
      })
      .filter((v) => v > 0);

    if (values.length === 0) return 0;
    return values.reduce((sum, current) => sum + current, 0) / values.length;
  }

  get averageProjectBudget(): number {
    const values = this.myProjects.map((project) => project.budget ?? 0).filter((v) => v > 0);
    if (values.length === 0) return 0;
    return values.reduce((sum, current) => sum + current, 0) / values.length;
  }

  get totalApplicantsCount(): number {
    return this.myJobs.reduce((sum, job) => sum + (job.applicantIds?.length ?? 0), 0);
  }

  get jobStatusChart(): { label: string; count: number; percent: number; tone: string }[] {
    const total = this.myJobs.length || 1;
    return [
      { label: 'OPEN', count: this.openJobsCount, percent: (this.openJobsCount / total) * 100, tone: 'success' },
      { label: 'DRAFT', count: this.draftJobsCount, percent: (this.draftJobsCount / total) * 100, tone: 'warning' },
      { label: 'CLOSED', count: this.closedJobsCount, percent: (this.closedJobsCount / total) * 100, tone: 'danger' }
    ];
  }

  get projectStatusChart(): { label: string; count: number; percent: number; tone: string }[] {
    const total = this.myProjects.length || 1;
    return [
      { label: 'OPEN', count: this.openProjectsCount, percent: (this.openProjectsCount / total) * 100, tone: 'success' },
      { label: 'IN_PROGRESS', count: this.inProgressProjectsCount, percent: (this.inProgressProjectsCount / total) * 100, tone: 'secondary' },
      { label: 'CLOSED', count: this.closedProjectsCount, percent: (this.closedProjectsCount / total) * 100, tone: 'neutral' }
    ];
  }

  get paginatedJobs(): JobOffer[] {
    const start = (this.jobsPage - 1) * this.pageSize;
    return this.visibleJobs.slice(start, start + this.pageSize);
  }

  get paginatedProjects(): Project[] {
    const start = (this.projectsPage - 1) * this.pageSize;
    return this.myProjects.slice(start, start + this.pageSize);
  }

  get totalJobPages(): number {
    return Math.ceil(this.visibleJobs.length / this.pageSize);
  }

  get totalProjectPages(): number {
    return Math.ceil(this.myProjects.length / this.pageSize);
  }

  constructor(
    private jobService: JobService,
    private projectService: ProjectService,
    private fb: FormBuilder
  ) {
    this.editJobForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      description: ['', Validators.required],
      salaryMin: [0, [Validators.min(0)]],
      salaryMax: [0, [Validators.min(0)]],
      deadline: [''],
      status: ['OPEN']
    });

    this.editProjectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      budget: [0, [Validators.required, Validators.min(1)]],
      deadline: ['', Validators.required],
      status: ['OPEN', Validators.required]
    });
  }

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

    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.myProjects = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.warn('Projects backend unavailable or error:', err);
        this.myProjects = [];
      }
    });
  }

  openEditJob(job: JobOffer): void {
    if (!job.id) {
      return;
    }

    this.jobActionError = '';
    this.editingJobId = job.id;
    this.editJobForm.patchValue({
      title: job.title ?? '',
      company: job.company ?? '',
      location: job.location ?? '',
      description: job.description ?? '',
      salaryMin: job.salaryMin ?? 0,
      salaryMax: job.salaryMax ?? 0,
      deadline: job.deadline ?? '',
      status: job.status ?? 'OPEN'
    });
  }

  closeEditJob(): void {
    this.editingJobId = null;
    this.isSavingJob = false;
    this.jobActionError = '';
    this.editJobForm.reset({
      title: '',
      company: '',
      location: '',
      description: '',
      salaryMin: 0,
      salaryMax: 0,
      deadline: '',
      status: 'OPEN'
    });
  }

  saveJobChanges(): void {
    if (this.editingJobId === null || this.editJobForm.invalid) {
      this.editJobForm.markAllAsTouched();
      return;
    }

    this.isSavingJob = true;
    this.jobActionError = '';

    this.jobService.updatePartial(this.editingJobId, this.editJobForm.value).subscribe({
      next: () => {
        this.isSavingJob = false;
        this.jobService.getAll().subscribe({
          next: (data) => {
            this.myJobs = Array.isArray(data) ? data : [];
            this.closeEditJob();
          },
          error: () => {
            this.closeEditJob();
          }
        });
      },
      error: (err) => {
        console.error('Failed to update job:', err);
        this.isSavingJob = false;
        this.jobActionError = 'Failed to update job.';
      }
    });
  }

  deleteJob(job: JobOffer): void {
    if (!job.id) {
      return;
    }

    const confirmed = window.confirm(`Delete job "${job.title}"?`);
    if (!confirmed) {
      return;
    }

    this.jobService.delete(job.id).subscribe({
      next: () => {
        this.myJobs = this.myJobs.filter((j) => j.id !== job.id);
      },
      error: (err) => {
        console.error('Delete failed, trying soft close:', err);
        this.jobService.updatePartial(job.id!, { status: 'CLOSED' }).subscribe({
          next: () => {
            this.myJobs = this.myJobs.filter((j) => j.id !== job.id);
            this.jobActionError = '';
          },
          error: (closeErr) => {
            console.error('Failed to close job:', closeErr);
            this.jobActionError = 'Failed to delete job (server error).';
          }
        });
      }
    });
  }

  openEditProject(project: Project): void {
    if (!project.id) {
      return;
    }

    this.projectActionError = '';
    this.editingProjectId = project.id;
    this.editProjectForm.patchValue({
      title: project.title ?? '',
      description: project.description ?? '',
      budget: project.budget ?? 0,
      deadline: project.deadline ?? '',
      status: project.status ?? 'OPEN'
    });
  }

  closeEditProject(): void {
    this.editingProjectId = null;
    this.isSavingProject = false;
    this.projectActionError = '';
    this.editProjectForm.reset();
    this.editProjectForm.patchValue({ status: 'OPEN' });
  }

  saveProjectChanges(): void {
    if (this.editingProjectId === null || this.editProjectForm.invalid) {
      this.editProjectForm.markAllAsTouched();
      return;
    }

    this.isSavingProject = true;
    this.projectActionError = '';

    this.projectService.updateProjectPartial(this.editingProjectId, this.editProjectForm.value).subscribe({
      next: () => {
        this.isSavingProject = false;
        this.loadProjects();
        this.closeEditProject();
      },
      error: (err) => {
        console.error('Failed to update project:', err);
        this.isSavingProject = false;
        this.projectActionError = 'Failed to update project.';
      }
    });
  }

  deleteProject(project: Project): void {
    if (!project.id) {
      return;
    }

    const confirmed = window.confirm(`Delete project "${project.title}"?`);
    if (!confirmed) {
      return;
    }

    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.myProjects = this.myProjects.filter((p) => p.id !== project.id);
      },
      error: (err) => {
        console.error('Failed to delete project:', err);
        this.projectActionError = 'Failed to delete project.';
      }
    });
  }
}
