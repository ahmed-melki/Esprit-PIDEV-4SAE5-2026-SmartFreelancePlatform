import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '../services/campaign.service';
import { CampaignStatisticsResult } from '../models/marketing.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-marketing-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './marketing-dashboard.component.html',
  styleUrl: './marketing-dashboard.component.css'
})
export class MarketingDashboardComponent implements OnInit {
  stats?: CampaignStatisticsResult;
  isLoading = true;

  // Pie Chart (Status Distribution)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartType: ChartType = 'pie';

  // Bar Chart (Performance Overview - Mock Comparison for now)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: { min: 0 }
    },
    plugins: {
      legend: { display: true, position: 'top' },
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: ['Avg Discount', 'Max Promo Count'],
    datasets: [
      { data: [0, 0], label: 'Current Performance', backgroundColor: '#6366f1' }
    ]
  };

  constructor(private campaignService: CampaignService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.campaignService.getStatistics().subscribe({
      next: (res) => {
        this.stats = res;
        this.updateCharts(res);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.isLoading = false;
      }
    });
  }

  private updateCharts(s: CampaignStatisticsResult): void {
    // Update Pie
    const labels = Object.keys(s.campaignsByStatus);
    const counts = Object.values(s.campaignsByStatus);
    this.pieChartData = {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b']
      }]
    };

    // Update Bar
    this.barChartData = {
      labels: ['Avg Discount (%)', 'Max Promotions'],
      datasets: [{
        data: [s.averageDiscountAcrossAll, s.maxPromotionCount],
        label: 'Global Metrics',
        backgroundColor: ['#818cf8', '#34d399']
      }]
    };
  }
}
