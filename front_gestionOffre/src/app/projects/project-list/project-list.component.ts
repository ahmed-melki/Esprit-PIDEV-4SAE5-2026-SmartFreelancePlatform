import { Component, OnInit } from '@angular/core';
import { ProjectService, Project } from '../project.service';
import { Router } from '@angular/router';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { NgFor, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.css'] // N'oubliez pas d'ajouter le CSS
    ,
    standalone: true,
    imports: [MatFormField, MatLabel, MatSelect, MatOption, MatInput, NgFor, MatCard, NgClass, MatCardHeader, MatIcon, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatButton, CurrencyPipe, DatePipe]
})
export class ProjectListComponent implements OnInit {
  // Données
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  
  // États
  loading: boolean = false;
  selectedStatus: string = 'all';
  searchText: string = '';
  
  // Pour le tableau (si vous gardez l'ancienne vue)
  displayedColumns: string[] = ['id', 'title', 'description', 'budget', 'deadline', 'status', 'actions'];

  constructor(
    private projectService: ProjectService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  /**
   * Charge tous les projets depuis le service
   */
  loadProjects(): void {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: (data) => {
        this.projects = data;
        this.filteredProjects = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des projets:', err);
        this.loading = false;
        // Optionnel : afficher un message d'erreur à l'utilisateur
      }
    });
  }

  /**
   * Retourne la classe CSS en fonction du statut du projet
   */
  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'open':
      case 'overt':
        return 'open';
      case 'in_progress':
      case 'in progress':
        return 'in_progress';
      case 'closed':
      case 'fermé':
        return 'closed';
      case 'cancelled':
      case 'annulé':
        return 'cancelled';
      default:
        return '';
    }
  }

  /**
   * Navigue vers la page de détail d'un projet
   */
  viewProject(id: number | undefined): void {
    if (id) {
      console.log('Voir projet:', id);
      this.router.navigate(['/projects', id]);
    }
  }

  /**
   * Navigue vers la page d'édition d'un projet
   */
  editProject(id: number | undefined): void {
    if (id) {
      console.log('Éditer projet:', id);
      this.router.navigate(['/projects/edit', id]);
    }
  }

  /**
   * Supprime un projet après confirmation
   */
  deleteProject(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      this.projectService.delete(id).subscribe({
        next: () => {
          console.log('Projet supprimé avec succès');
          this.loadProjects(); // Recharge la liste
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert('Erreur lors de la suppression du projet');
        }
      });
    }
  }

  /**
   * Applique les filtres (statut et recherche)
   */
  applyFilter(event?: any): void {
    // Met à jour le texte de recherche si un événement est passé
    if (event) {
      this.searchText = event.target.value.toLowerCase();
    }
    
    // Filtre les projets
    this.filteredProjects = this.projects.filter(project => {
      // Filtre par texte de recherche
      const matchesSearch = this.searchText === '' || 
        project.title?.toLowerCase().includes(this.searchText) ||
        project.description?.toLowerCase().includes(this.searchText);
      
      // Filtre par statut
      const matchesStatus = this.selectedStatus === 'all' || 
        project.status?.toLowerCase() === this.selectedStatus.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Réinitialise tous les filtres
   */
  resetFilters(): void {
    this.selectedStatus = 'all';
    this.searchText = '';
    this.filteredProjects = this.projects;
  }

  /**
   * Compte le nombre de projets par statut
   */
  getProjectCountByStatus(status: string): number {
    return this.projects.filter(p => p.status?.toLowerCase() === status.toLowerCase()).length;
  }

  /**
   * Obtient le libellé du statut en français
   */
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'open': 'Open',
      'in_progress': 'In progress',
      'closed': 'Closed',
      'cancelled': 'Annulé'
    };
    return statusMap[status?.toLowerCase()] || status;
  } 

  getMatchedSkills(project: Project): string[] {
  // Si vous avez les compétences du freelancer en session
  const freelancerSkills = ['Angular', 'Spring Boot', 'Java']; // À remplacer par les vraies compétences
  
  const searchText = (project.title + ' ' + project.description).toLowerCase();
  return freelancerSkills.filter(skill => 
    searchText.includes(skill.toLowerCase())
  );
}
}