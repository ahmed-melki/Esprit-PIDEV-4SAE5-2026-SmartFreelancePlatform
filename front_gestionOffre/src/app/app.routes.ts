// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectFormComponent } from './projects/project-form/project-form.component';
import { OffreListComponent } from './freelancer/Offre-list/offre-list.component';
import { DeadlineCalendarComponent } from './deadline-calendar/deadline-calendar.component';
import { DeadlinePageComponent } from './deadline-calendar/deadline-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: 'projects', component: ProjectListComponent },
  { path: 'projects/new', component: ProjectFormComponent },
  { path: 'projects/edit/:id', component: ProjectFormComponent },
   { path: 'offres', component: OffreListComponent },
    { path: 'calendar', component: DeadlinePageComponent },
];