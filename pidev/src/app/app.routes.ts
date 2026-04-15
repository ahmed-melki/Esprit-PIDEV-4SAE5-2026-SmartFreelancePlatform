import { Routes } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { LoginComponent } from './core/auth/login/login.component';
import { SignupComponent } from './core/auth/signup/signup.component';
import { RoleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [RoleGuard],
    data: { role: 'ADMIN' }
  },
  // Si FreelancerModule n'existe pas encore, commentez ces lignes :
  {
  path: 'freelancer',
  loadChildren: () => import('./freelancer/freelancer.module').then(m => m.FreelancerModule),
  canActivate: [RoleGuard],
  data: { role: 'FREELANCER' }
},
{
  path: 'client',
  loadChildren: () => import('./client/client.module').then(m => m.ClientModule),
  canActivate: [RoleGuard],
  data: { role: 'CLIENT' }
}
];