import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(PieController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {

  stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalFreelancers: 0,
    totalClients: 0
  };

  recentActivities = [
    { action: 'Login', user: 'Admin', time: '5 minutes ago' },
    { action: 'Update', user: 'John Doe', time: '10 minutes ago' },
    { action: 'Registration', user: 'Jane Smith', time: '30 minutes ago' }
  ];

  private chart: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  loadStats(): void {
    this.http.get<any>('http://localhost:8082/api/users/stats').subscribe({
      next: (data) => {
        this.stats.totalUsers = data.totalUsers;
        this.stats.activeUsers = data.activeUsers;
        this.stats.totalFreelancers = data.freelancers;
        this.stats.totalClients = data.clients;
        this.updateChart();
      },
      error: () => {
        console.log('Could not load stats from backend.');
      }
    });
  }

  renderChart(): void {
    const canvas = document.getElementById('rolesChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Freelancers', 'Clients'],
        datasets: [{
          data: [this.stats.totalFreelancers, this.stats.totalClients],
          backgroundColor: ['#5DCAA5', '#378ADD'],
          borderColor: ['#ffffff', '#ffffff'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: { size: 13 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const value = context.parsed;
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return ` ${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  updateChart(): void {
    if (this.chart) {
      this.chart.data.datasets[0].data = [this.stats.totalFreelancers, this.stats.totalClients];
      this.chart.update();
    }
  }

  refreshStats(): void {
    this.loadStats();
  }
}