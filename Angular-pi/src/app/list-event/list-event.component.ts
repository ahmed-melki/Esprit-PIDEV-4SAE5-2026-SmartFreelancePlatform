import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { Event } from '../event.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  templateUrl: './list-event.component.html',
   styleUrls: ['./list-event.component.css'],
})
export class ListComponent implements OnInit {

  events: Event[] = [];

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
