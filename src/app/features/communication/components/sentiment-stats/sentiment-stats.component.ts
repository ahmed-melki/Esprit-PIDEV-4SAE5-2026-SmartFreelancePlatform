import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

type SentimentName = 'Positifs' | 'Neutres' | 'Négatifs';

@Component({
  selector: 'app-sentiment-stats',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './sentiment-stats.component.html',
  styleUrls: ['./sentiment-stats.component.scss']
})
export class SentimentStatsComponent implements OnChanges {
  @Input() positive = 0;
  @Input() neutral = 0;
  @Input() negative = 0;

  chartData: Array<{ name: SentimentName; value: number }> = [];

  // Palette: vert / orange / rouge
  colorScheme: Color = {
    name: 'sentiments',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#2e7d32', '#f57f17', '#c62828']
  };

  ngOnChanges(): void {
    this.updateChartData();
  }

  private updateChartData(): void {
    this.chartData = [
      { name: 'Positifs', value: Number(this.positive ?? 0) },
      { name: 'Neutres', value: Number(this.neutral ?? 0) },
      { name: 'Négatifs', value: Number(this.negative ?? 0) }
    ];
  }
}
