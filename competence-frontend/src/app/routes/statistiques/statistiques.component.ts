import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';
import {
  StatistiquesGlobales,
  StatistiquesService,
  StatistiqueCompetenceDto,
} from '../../services/statistiques.service';
import { SkillService } from '../../services/skill.service';
import { Skill } from '../../models/skill.model';

/**
 * Composant d'affichage du tableau de bord statistique.
 * Affiche des cartes, un tableau de répartition et des graphiques (camembert, histogramme).
 */
@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    TranslateModule,
    BaseChartDirective,
  ],
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.scss'],
})
export class StatistiquesComponent implements OnInit {
  private readonly statistiquesService = inject(StatistiquesService);
  private readonly skillService = inject(SkillService);

  stats?: StatistiquesGlobales;
  displayedColumns = ['niveau', 'total'];
  loading = true;
  error: string | null = null;

  /** Données pour le camembert : répartition des compétences par niveau */
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'] }],
  };
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  /** Données pour l'histogramme : top 5 compétences par note moyenne */
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ label: 'Note moyenne', data: [], backgroundColor: 'rgba(102, 187, 106, 0.7)' }],
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 5 },
      x: {},
    },
    plugins: { legend: { display: false } },
  };

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.error = null;
    this.statistiquesService.getGlobalStats().subscribe({
      next: data => {
        this.stats = data;
        this.buildPieChart();
        this.loadTopSkillsBarChart();
        this.loading = false;
      },
      error: err => {
        console.error('Erreur statistiques globales', err);
        this.error = 'Erreur lors du chargement des statistiques.';
        this.loading = false;
      },
    });
  }

  private buildPieChart(): void {
    const rep = this.stats?.repartitionParNiveau ?? [];
    this.pieChartData = {
      labels: rep.map(r => r.niveau),
      datasets: [
        {
          data: rep.map(r => r.total),
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D'],
        },
      ],
    };
  }

  /** Charge les stats des 5 premières compétences pour l'histogramme (note moyenne). */
  private loadTopSkillsBarChart(): void {
    this.skillService.getAllSkills().subscribe({
      next: (skills: Skill[]) => {
        const top5 = (skills ?? []).slice(0, 5).filter((s: Skill) => s.idSkill != null);
        if (top5.length === 0) {
          this.barChartData = {
            labels: [],
            datasets: [{ label: 'Note moyenne', data: [], backgroundColor: 'rgba(102, 187, 106, 0.7)' }],
          };
          return;
        }
        const requests = top5.map((s: Skill) =>
          this.statistiquesService.getStatistiquesCompetence(s.idSkill!)
        );
        forkJoin(requests).subscribe({
          next: (results: StatistiqueCompetenceDto[]) => {
            const sorted = [...results].sort((a, b) => (b.noteMoyenne ?? 0) - (a.noteMoyenne ?? 0));
            this.barChartData = {
              labels: sorted.map(s => s.nomSkill),
              datasets: [
                {
                  label: 'Note moyenne',
                  data: sorted.map(s => s.noteMoyenne ?? 0),
                  backgroundColor: 'rgba(102, 187, 106, 0.7)',
                },
              ],
            };
          },
          error: (err: any) => console.error('Erreur stats par compétence', err),
        });
      },
      error: (err: any) => console.error('Erreur chargement compétences', err),
    });
  }
}
