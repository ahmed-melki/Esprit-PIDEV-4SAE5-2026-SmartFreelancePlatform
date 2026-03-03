import { Routes } from '@angular/router';
import { ListComponent } from './list-event/list-event.component';
import { CreateComponent } from './create-event/create-event.component';
import { EventEditComponent } from './update-event/update-event.component';
import { EventMoodComponent } from './event-mood/event-mood.component';
import { ListeventfrontComponent } from './list-eventfront/list-eventfront.component';
import { SponsorshipComponent } from './sponsorship/sponsorship.component';

export const routes: Routes = [
   // Route mood avant edit
  { path: 'events/:id/mood', component: EventMoodComponent },
  { path: 'event', component: ListComponent },
  { path: 'event/create', component: CreateComponent },
  { path: 'event/edit/:id', component: EventEditComponent },
   { path: 'eventfront', component: ListeventfrontComponent },
      { path: 'sponsorship/:eventId', component: SponsorshipComponent },
  { path: '', redirectTo: 'event', pathMatch: 'full' },
  { path: '**', redirectTo: 'event' }
];