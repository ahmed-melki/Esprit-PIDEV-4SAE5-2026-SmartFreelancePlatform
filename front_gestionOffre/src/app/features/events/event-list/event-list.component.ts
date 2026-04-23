import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event, EventType } from '../models/event.model';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.css'
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  isLoading = true;
  searchTerm = '';
  typeFilter: EventType | '' = '';
  errorMessage: string | null = null;

  eventTypes = Object.values(EventType);

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService
      .getAll()
      .pipe(
        catchError(err => {
          console.error('Events API not available', err);
          return of([]);
        })
      )
      .subscribe({
        next: (res) => {
          this.events = res;
          this.isLoading = false;
          this.errorMessage = null;
        },
        error: (err) => {
          console.error('Error loading events', err);
          this.events = [];
          this.isLoading = false;
          this.errorMessage = 'Impossible de charger les événements. Veuillez vérifier votre connexion au serveur.';
        }
      });
  }

  get filteredEvents(): Event[] {
    return this.events.filter(e => {
      const title = e.title?.toLowerCase() || '';
      const location = e.location?.toLowerCase() || '';
      const search = this.searchTerm.toLowerCase();
      
      const matchesSearch = title.includes(search) || location.includes(search);
      const matchesType = !this.typeFilter || e.type === this.typeFilter;
      
      return matchesSearch && matchesType;
    });
  }

  getTypeClass(type: EventType): string {
    return `type-${type.toLowerCase().replace('_', '-')}`;
  }
}
