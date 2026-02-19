import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../event.service';

@Component({
  selector: 'app-event-edit',
  templateUrl: './update-event.component.html',
  styleUrls: ['./update-event.component.css']
})
export class EventEditComponent implements OnInit {

  event: any = {};   // ⚠️ important pour éviter erreur undefined
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

ngOnInit(): void {

  this.route.paramMap.subscribe(params => {

    this.id = Number(params.get('id'));
    console.log("ID récupéré =", this.id);

    this.eventService.getById(this.id).subscribe({
      next: (data: any) => {
        console.log("DATA reçue =", data);  // 👈 TRÈS IMPORTANT
        this.event = data;
      },
      error: (err: any) => console.error("Erreur backend =", err)
    });

  });
}


  update(): void {
    this.eventService.updateEvent(this.id, this.event).subscribe({
      next: () => alert("Événement modifié avec succès"),
      error: (err: any) => console.error(err)
    });
  }
}
