import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-find-project',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './find-project.component.html',
  styleUrl: './find-project.component.css'
})
export class FindProjectComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  error = false;

  // Pagination & Filtering
  pageSize = 8;
  currentPage = 1;
  searchTerm = '';
  Math = Math;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.fetchProjects();
  }

  fetchProjects(): void {
    this.isLoading = true;
    this.projectService.getProjects().subscribe({
      next: (data) => {
        // Handle potential object wrapping if needed
        this.projects = Array.isArray(data) ? data : (data as any).projects || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  get filteredProjects(): Project[] {
    return this.projects.filter(p => 
      (p.title?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) ?? false) ||
      (p.description?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) ?? false)
    );
  }

  get paginatedProjects(): Project[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProjects.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProjects.length / this.pageSize);
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.currentPage = 1;
  }
}
