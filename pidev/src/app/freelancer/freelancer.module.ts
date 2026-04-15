import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FreelancerRoutingModule } from './freelancer-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  declarations: [DashboardComponent],
  imports: [CommonModule, FreelancerRoutingModule]
})
export class FreelancerModule { }