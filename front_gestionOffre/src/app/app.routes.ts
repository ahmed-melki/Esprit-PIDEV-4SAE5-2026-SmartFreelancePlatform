// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectFormComponent } from './projects/project-form/project-form.component';
import { OffreListComponent } from './freelancer/Offre-list/offre-list.component';
import { DeadlineCalendarComponent } from './deadline-calendar/deadline-calendar.component';
import { DeadlinePageComponent } from './deadline-calendar/deadline-page.component';
import { JobListComponent } from './jobs/job-list/job-list.component';
import { JobFormComponent } from './jobs/job-form/job-form.component';
import { QuizComponent } from './quiz/quiz.component';
import { JobsFrontComponent } from './jobs/jobs-front/jobs-front.component';
import { CandidatureFormComponent } from './candidatures/candidature-form/candidature-form.component';
import { MesCandidaturesComponent } from './candidatures/mes-candidatures/mes-candidatures.component';
import { GestionCandidaturesComponent } from './candidatures/gestion-candidatures/gestion-candidatures.component';

export const routes: Routes = [
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: 'projects', component: ProjectListComponent },
  { path: 'projects/new', component: ProjectFormComponent },
  { path: 'projects/edit/:id', component: ProjectFormComponent },
   { path: 'offres', component: OffreListComponent },
    { path: 'calendar', component: DeadlinePageComponent },
    { path: 'jobs', component: JobListComponent },
  { path: 'jobs/new', component: JobFormComponent },
  { path: 'jobs/edit/:id', component: JobFormComponent },
  { path: 'quiz/:id', component: QuizComponent },
  { path: 'jobs-front', component: JobsFrontComponent },
  { path: 'postuler/:jobId', component: CandidatureFormComponent },
  { path: 'mes-candidatures', component: MesCandidaturesComponent },
  { path: 'gestion-candidatures/:jobId', component: GestionCandidaturesComponent },
];