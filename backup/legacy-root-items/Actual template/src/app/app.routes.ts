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
import { ChatComponent } from './features/communication/chat/chat.component';
import { FaqManagerComponent } from './features/communication/faq-manager/faq-manager.component';
import { BadWordManagerComponent } from './features/communication/bad-word-manager/bad-word-manager.component';
import { MarketingDashboardComponent } from './features/marketing/marketing-dashboard/marketing-dashboard.component';
import { CampaignListComponent } from './features/marketing/campaign-list/campaign-list.component';
import { CampaignDetailComponent } from './features/marketing/campaign-detail/campaign-detail.component';
import { EventListComponent } from './features/events/event-list/event-list.component';
import { EventDetailComponent } from './features/events/event-detail/event-detail.component';
import { SponsorshipFormComponent } from './features/events/sponsorship-form/sponsorship-form.component';
import { ArticleListComponent } from './features/blog/article-list/article-list.component';
import { ArticleDetailComponent } from './features/blog/article-detail/article-detail.component';
import { SkillListComponent } from './features/competence/skill-list/skill-list.component';
import { SkillDetailComponent } from './features/competence/skill-detail/skill-detail.component';

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
  // Communication routes
  { path: 'communication', component: ChatComponent },
  { path: 'communication/faq', component: FaqManagerComponent },
  { path: 'communication/bad-words', component: BadWordManagerComponent },
  // Marketing routes
  { path: 'marketing', redirectTo: 'marketing/dashboard', pathMatch: 'full' },
  { path: 'marketing/dashboard', component: MarketingDashboardComponent },
  { path: 'marketing/campaigns', component: CampaignListComponent },
  { path: 'marketing/campaign/:id', component: CampaignDetailComponent },
  // Event routes
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'events/:id/sponsor', component: SponsorshipFormComponent },
  // Blog routes
  { path: 'blog', component: ArticleListComponent },
  { path: 'blog/:id', component: ArticleDetailComponent },
  // Competence routes
  { path: 'competence', component: SkillListComponent },
  { path: 'competence/:id', component: SkillDetailComponent },
  { path: '**', redirectTo: '' }
];
