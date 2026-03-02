import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeadlineCalendarComponent } from './deadline-calendar.component';
import { ProjectService, Project } from '../projects/project.service';
@Component({
  selector: 'app-deadline-page',
  standalone: true,
  imports: [CommonModule, DeadlineCalendarComponent],
  template: `
    <div class="deadline-page">
      <app-deadline-calendar [projects]="projects"></app-deadline-calendar>
    </div>
  `,
  styles: [`
    .deadline-page {
      padding: 20px;
      min-height: calc(100vh - 130px);
      background: #f8f9fa;
    }
  `]
})
export class DeadlinePageComponent implements OnInit {
  projects: Project[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    console.log('Chargement des projets...');
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data;
        console.log('Projets chargés:', this.projects);
        console.log('Nombre de projets:', this.projects.length);
        
        // Afficher les dates pour vérifier le format
        if (this.projects.length > 0) {
          console.log('Dates des projets:', this.projects.map(p => p.deadline));
        }
      },
      error: (err) => {
        console.error('Erreur chargement projets:', err);
      }
    });
  }
}