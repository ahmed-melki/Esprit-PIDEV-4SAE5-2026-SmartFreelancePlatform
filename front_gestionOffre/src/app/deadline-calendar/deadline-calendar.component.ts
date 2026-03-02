import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {  OnChanges, SimpleChanges } from '@angular/core';
// Services
import { Project } from '../projects/project.service';

@Component({
  selector: 'app-deadline-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatBadgeModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './deadline-calendar.component.html',
  styleUrls: ['./deadline-calendar.component.css']
})
export class DeadlineCalendarComponent implements  OnInit, OnChanges {
  @Input() projects: Project[] = [];
  
  selectedDate: Date | null = null;
  currentMonth: Date = new Date();
  monthNames: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  dayNames: string[] = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  calendarDays: any[] = [];
  viewMode: 'month' | 'list' = 'month';
  loading: boolean = false;
  
  // Pour utiliser Math dans le template
  Math = Math;
  
  // Statistiques
  stats = {
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    overdue: 0,
    nextDeadlines: [] as Project[]
  };

  ngOnInit(): void {
    this.generateCalendar();
    this.calculateStats();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projects'] && changes['projects'].currentValue) {
      console.log('Projets mis à jour:', this.projects);
      console.log('Nombre de projets reçus:', this.projects.length);
      
      // Recalculer quand les projets changent
      this.generateCalendar();
      this.calculateStats();
    }
  }

  /**
   * Génère les jours du calendrier pour le mois courant
   */
  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Premier jour du mois (0 = dimanche, 1 = lundi...)
    const firstDay = new Date(year, month, 1).getDay();
    // Ajuster pour que lundi soit le premier jour (0 = lundi)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    // Nombre de jours dans le mois
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    this.calendarDays = [];
    
    // Jours du mois précédent
    for (let i = 0; i < startOffset; i++) {
      const date = new Date(year, month, -i);
      this.calendarDays.unshift({
        day: date.getDate(),
        currentMonth: false,
        date: date,
        projects: this.getProjectsForDate(date)
      });
    }
    
    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      this.calendarDays.push({
        day: i,
        currentMonth: true,
        date: date,
        projects: this.getProjectsForDate(date)
      });
    }
    
    // Compléter pour avoir 6 lignes (42 jours)
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({
        day: i,
        currentMonth: false,
        date: date,
        projects: this.getProjectsForDate(date)
      });
    }
  }

  /**
   * Récupère les projets pour une date donnée
   */
  getProjectsForDate(date: Date): Project[] {
    const dateString = this.formatDateString(date);
    return this.projects.filter(p => p.deadline === dateString);
  }

  /**
   * Formate une date en string YYYY-MM-DD
   */
  formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Vérifie si une date a des projets
   */
  hasProjects(date: Date): boolean {
    return this.getProjectsForDate(date).length > 0;
  }

  /**
   * Obtient le nombre de projets pour une date
   */
  getProjectCount(date: Date): number {
    return this.getProjectsForDate(date).length;
  }

  /**
   * Obtient la classe CSS pour un jour
   */
  getDayClass(day: any): string {
    const classes = [];
    
    if (!day.currentMonth) classes.push('other-month');
    if (this.isToday(day.date)) classes.push('today');
    if (this.isSelected(day.date)) classes.push('selected');
    if (this.hasProjects(day.date)) classes.push('has-deadline');
    
    return classes.join(' ');
  }

  /**
   * Vérifie si une date est aujourd'hui
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Vérifie si une date est sélectionnée
   */
  isSelected(date: Date): boolean {
    return this.selectedDate?.toDateString() === date.toDateString();
  }

  /**
   * Sélectionne une date
   */
  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  /**
   * Change de mois
   */
  changeMonth(delta: number): void {
    this.loading = true;
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + delta,
      1
    );
    this.generateCalendar();
    setTimeout(() => this.loading = false, 300);
  }

  /**
   * Retourne au mois courant
   */
  goToToday(): void {
    this.currentMonth = new Date();
    this.selectedDate = new Date();
    this.generateCalendar();
  }

  /**
   * Calcule les statistiques
   */
  calculateStats(): void {
    this.stats.total = this.projects.length;
    
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    this.stats.thisWeek = this.projects.filter(p => {
      const deadline = new Date(p.deadline);
      return deadline >= today && deadline <= nextWeek;
    }).length;
    
    this.stats.thisMonth = this.projects.filter(p => {
      const deadline = new Date(p.deadline);
      return deadline >= today && deadline <= nextMonth;
    }).length;
    
    this.stats.overdue = this.projects.filter(p => {
      const deadline = new Date(p.deadline);
      return deadline < today;
    }).length;
    
    // Prochaines deadlines (5 prochains)
    this.stats.nextDeadlines = [...this.projects]
      .filter(p => new Date(p.deadline) >= today)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
  }

  /**
   * Obtient la couleur selon le statut
   */
  getStatusColor(status: string): string {
    switch(status) {
      case 'OPEN': return '#3498db';
      case 'IN_PROGRESS': return '#f39c12';
      case 'CLOSED': return '#95a5a6';
      default: return '#9b59b6';
    }
  }

  /**
   * Vérifie si une date est passée
   */
  isPastDate(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  }

  /**
   * Calcule le nombre de jours restants
   */
  getDaysLeft(deadline: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Vérifie si une deadline est urgente (moins de 7 jours)
   */
  isUrgent(deadline: string): boolean {
    const daysLeft = this.getDaysLeft(deadline);
    return daysLeft <= 7 && daysLeft >= 0;
  }

  /**
   * Vérifie si un projet est en retard
   */
  isProjectOverdue(project: Project): boolean {
    return this.isPastDate(new Date(project.deadline));
  }

  /**
   * Vérifie si un projet est urgent
   */
  isProjectUrgent(project: Project): boolean {
    return !this.isPastDate(new Date(project.deadline)) && 
           this.isUrgent(project.deadline);
  }

  /**
   * Vérifie si un projet a une deadline passée
   */
  isProjectPast(project: Project): boolean {
    return this.isPastDate(new Date(project.deadline));
  }

  /**
   * Rafraîchit les données
   */
  refresh(): void {
    this.calculateStats();
  }
}