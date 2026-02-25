import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; // ← AJOUT

// Services
import { ProjectService, Project } from '../../projects/project.service';
import { AuthService } from '../../core/authentication/auth.service';

@Component({
  selector: 'app-offre-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatPaginatorModule // ← AJOUT
  ],
  templateUrl: './offre-list.component.html',
  styleUrls: ['./offre-list.component.css']
})
export class OffreListComponent implements OnInit {
  // Données
  allProjects: Project[] = [];
  matchedProjects: Project[] = [];
  
  // Compétences du freelancer
  freelancerSkills: string[] = [];
  freelancerId: number = 3;
  
  // États
  loading: boolean = false;
  error: string | null = null;
  // ✅ Pour utiliser Math.min dans le template
  Math = Math;
  // Statistiques
  stats = {
    total: 0,
    matched: 0
  };
  
  // ✅ PAGINATION
  pageSize: number = 6; // Nombre d'éléments par page
  currentPage: number = 0; // Page courante (0-indexed)
  pageSizeOptions: number[] = [3, 6, 9, 12]; // Options de taille de page

  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFreelancerSkills();
  }

  /**
   * Charge les compétences du freelancer
   */
  loadFreelancerSkills(): void {
    this.loading = true;
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.skills) {
      this.freelancerSkills = currentUser.skills;
      this.loadAllProjects();
      return;
    }
    
    // Pour les tests
    console.log('Utilisation de compétences de test');
    this.freelancerSkills = [ 'economie', 'marketing','design','adobe'];
    this.loadAllProjects();
  }

  /**
   * Charge tous les projets depuis l'API
   */
  loadAllProjects(): void {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        // Ne garder que les projets ouverts
        this.allProjects = projects.filter(p => p.status === 'OPEN');
        this.calculateMatches();
        this.stats.total = this.allProjects.length;
        this.loading = false;
        this.currentPage = 0; // Reset à la première page
      },
      error: (err) => {
        console.error('Erreur chargement projets:', err);
        this.error = 'Impossible de charger les offres';
        this.loading = false;
      }
    });
  }

  /**
   * Calcule les matchs pour chaque projet
   */
  calculateMatches(): void {
    if (!this.freelancerSkills.length) {
      this.matchedProjects = [];
      return;
    }

    this.matchedProjects = this.allProjects.filter(project => 
      this.getMatchScore(project) > 0
    );
    
    this.stats.matched = this.matchedProjects.length;
  }

  /**
   * Calcule le score de match pour un projet
   */
  getMatchScore(project: Project): number {
    if (!this.freelancerSkills.length) return 0;
    
    const searchText = (project.title + ' ' + project.description).toLowerCase();
    return this.freelancerSkills.filter(skill => 
      searchText.includes(skill.toLowerCase())
    ).length;
  }

  /**
   * Récupère les compétences matchées pour un projet
   */
  getMatchedSkills(project: Project): string[] {
    if (!this.freelancerSkills.length) return [];
    
    const searchText = (project.title + ' ' + project.description).toLowerCase();
    return this.freelancerSkills.filter(skill => 
      searchText.includes(skill.toLowerCase())
    );
  }

  /**
   * ✅ Obtient les projets pour la page courante
   */
  get paginatedProjects(): Project[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.allProjects.slice(start, end);
  }

  /**
   * ✅ Gère le changement de page
   */
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    // Scroll en haut de la liste
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Postuler à un projet
   */
  applyToProject(projectId: number | undefined): void {
    if (projectId) {
      console.log('Postuler au projet:', projectId);
      alert(`Candidature envoyée pour le projet ${projectId}`);
    }
  }

  /**
   * Rafraîchir la liste
   */
  refresh(): void {
    this.loadAllProjects();
  }
}