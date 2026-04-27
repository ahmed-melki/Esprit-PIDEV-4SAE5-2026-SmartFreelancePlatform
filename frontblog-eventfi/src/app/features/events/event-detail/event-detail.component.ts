import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../services/event.service';
import { Event, ReactionType, ReactionStats } from '../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit {
  event?: Event;
  stats?: ReactionStats;
  isLoading = true;
  isReacting = false;
  
  reactionTypes = Object.values(ReactionType);
  reactionLabels: { [key in ReactionType]: string } = {
    [ReactionType.VERY_INTERESTED]: 'Très Intéressé 🤩',
    [ReactionType.INTERESTED]: 'Intéressé 😊',
    [ReactionType.MAYBE]: 'Peut-être 🤔',
    [ReactionType.NOT_INTERESTED]: 'Pas intéressé 😐'
  };

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadEvent(id);
      this.loadStats(id);
    }
  }

  loadEvent(id: number): void {
    this.eventService.getById(id).subscribe({
      next: (res) => {
        this.event = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadStats(id: number): void {
    this.eventService.getStats(id).subscribe(res => this.stats = res);
  }

  onReact(type: ReactionType): void {
    if (!this.event?.id || this.isReacting) return;
    
    this.isReacting = true;
    this.eventService.react(this.event.id, type).subscribe({
      next: () => {
        this.loadStats(this.event!.id!);
        this.isReacting = false;
        alert('Merci pour votre réaction !');
      },
      error: (err) => {
        this.isReacting = false;
        // The backend throws exception if already reacted (as per the code provided)
        alert(err.error || 'Vous avez déjà voté pour cet événement.');
      }
    });
  }

  getStatValue(type: ReactionType): number {
    return this.stats ? (this.stats[type] || 0) : 0;
  }
}
