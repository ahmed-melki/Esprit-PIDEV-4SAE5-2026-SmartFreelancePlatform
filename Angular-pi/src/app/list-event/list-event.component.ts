import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { EventService } from '../event.service';
import { Event } from '../event.model';


@Component({
  selector: 'app-event-list',
  templateUrl: './list-event.component.html',
  styleUrls: ['./list-event.component.css'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    RouterLink,
    CurrencyPipe,
    DatePipe,
     
  ],
})
export class ListComponent implements OnInit {

  events: Event[] = [];

  constructor(private service: EventService, private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  // Charger tous les événements
  loadEvents() {
    this.service.getAll().subscribe(data => {
      this.events = data;
    });
  }

  // Supprimer un événement
  deleteEvent(id: number) {
    if (confirm("Voulez-vous vraiment supprimer cet événement ?")) {
      this.service.delete(id).subscribe(() => {
        alert('Événement supprimé avec succès !');
        this.loadEvents(); // Rafraîchir la liste
      }, error => {
        console.error(error);
        alert('Erreur lors de la suppression.');
      });
    }
  }

  // Navigation vers la modification
  editEvent(id: number) {
    this.router.navigate(['/event/edit', id]);
  }


  

  

}