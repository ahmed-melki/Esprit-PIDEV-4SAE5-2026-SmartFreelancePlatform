import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ClientDashboardComponent } from './features/client/client-dashboard/client-dashboard.component';
import { PostJobComponent } from './features/client/post-job/post-job.component';
import { PostProjectComponent } from './features/client/post-project/post-project.component';
import { PostQuizComponent } from './features/client/post-quiz/post-quiz.component';
import { FreelancerDashboardComponent } from './features/freelancer/freelancer-dashboard/freelancer-dashboard.component';
import { FindJobComponent } from './features/freelancer/find-job/find-job.component';
import { FindProjectComponent } from './features/freelancer/find-project/find-project.component';
import { TakeQuizComponent } from './features/freelancer/take-quiz/take-quiz.component';
import { ApplyJobComponent } from './features/freelancer/apply-job/apply-job.component';
import { JobApplicantsComponent } from './features/client/job-applicants/job-applicants.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Client routes
  { path: 'client/dashboard', component: ClientDashboardComponent },
  { path: 'client/post-job', component: PostJobComponent },
  { path: 'client/post-project', component: PostProjectComponent },
  { path: 'client/post-quiz/:jobId', component: PostQuizComponent },
  { path: 'client/job-applicants/:jobId', component: JobApplicantsComponent },
  // Freelancer routes
  { path: 'freelancer/dashboard', component: FreelancerDashboardComponent },
  { path: 'freelancer/find-job', component: FindJobComponent },
  { path: 'freelancer/find-project', component: FindProjectComponent },
  { path: 'freelancer/quiz/:jobId', component: TakeQuizComponent },
  { path: 'freelancer/apply/:jobId', component: ApplyJobComponent },
  { path: '**', redirectTo: '' }
];
