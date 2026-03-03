import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { Event } from '../event.model';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, CurrencyPipe, DatePipe, CommonModule } from '@angular/common';

@Component({
    selector: 'app-event-list',
    templateUrl: './list-eventfront.component.html',
    styleUrls: ['./list-eventfront.component.css'],
    standalone: true,
    imports: [
        NgFor,
        RouterLink,
        NgIf,
        CurrencyPipe,
        DatePipe,
         CommonModule,  
    ],
})
export class ListeventfrontComponent implements OnInit {

  events: Event[] = [];
  reactionService: any;

  constructor(private service: EventService,
              private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.service.getAll().subscribe(data => {
      this.events = data;
    });
  }

  deleteEvent(id: number) {
    if(confirm("Supprimer cet événement ?")) {
      this.service.delete(id).subscribe(() => {
        this.loadEvents();
      });
    }
  }

  editEvent(id: number) {
    this.router.navigate(['/back-office/event/update', id]);
  }

  
 
}
