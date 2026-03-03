import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MtxProgressModule } from '@ng-matero/extensions/progress';
import { ApexOptions } from 'apexcharts';
import { DashboardService, PeriodicElement } from './dashboard.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None, // Pour que les styles globaux fonctionnent
  standalone: true, // Si vous utilisez standalone components
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatTabsModule,
    MatGridListModule,
    MatListModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MtxProgressModule,
  

  ],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit {
  stats: any[] = [];
  charts: ApexOptions[] = [];
  messages: any[] = [];
  dataSource: PeriodicElement[] = [];
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.stats = this.dashboardService.getStats();
    this.charts = this.dashboardService.getCharts();
    this.messages = this.dashboardService.getMessages();
    this.dataSource = this.dashboardService.getData();
    
    // Initialiser les graphiques après le chargement de la vue
    setTimeout(() => {
      this.initCharts();
    });
  }

  initCharts(): void {
    // Initialisation des graphiques ApexCharts
    if (typeof ApexCharts !== 'undefined') {
      // Graphique 1
      const chart1 = new ApexCharts(
        document.querySelector('#chart1'),
        this.charts[0]
      );
      chart1.render();

      // Graphique 2
      const chart2 = new ApexCharts(
        document.querySelector('#chart2'),
        this.charts[1]
      );
      chart2.render();
    }
  }
}