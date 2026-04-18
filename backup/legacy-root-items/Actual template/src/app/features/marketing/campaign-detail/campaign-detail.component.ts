import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CampaignService } from '../services/campaign.service';
import { PromotionService } from '../services/promotion.service';
import { Campaign, Promotion, CampaignAnalysisResult, PromotionHealthDto } from '../models/marketing.model';
import { catchError, forkJoin, map, of } from 'rxjs';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-detail.component.html',
  styleUrl: './campaign-detail.component.css'
})
export class CampaignDetailComponent implements OnInit {
  campaign?: Campaign;
  promotions: Promotion[] = [];
  promotionHealth: { [key: number]: PromotionHealthDto } = {};
  analysis?: CampaignAnalysisResult;
  expiringCount = 0;
  expiringPromotionCodes: string[] = [];
  showExpiringBanner = true;
  
  isLoading = true;
  isAnalyzing = false;
  showPromoModal = false;

  editingPromotion: Promotion = this.initPromo();

  constructor(
    private route: ActivatedRoute,
    private campaignService: CampaignService,
    private promotionService: PromotionService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadData(id);
    }
  }

  loadData(id: number): void {
    this.campaignService.getById(id).subscribe({
      next: (camp) => {
        this.campaign = camp;
        this.loadPromotions(id);
      },
      error: () => this.isLoading = false
    });
  }

  loadPromotions(campaignId: number): void {
    this.promotionService.getByCampaign(campaignId).subscribe({
      next: promos => {
        this.promotions = Array.isArray(promos) ? promos : [];
        this.isLoading = false;
        console.log('[CampaignDetail] Promotions loaded:', this.promotions.length);

        // Keep expiring banner and health badges in sync with the latest dataset.
        this.loadExpiringSoon();

        this.promotions.forEach(p => {
          if (!p.id) return;
          this.promotionService.getHealth(p.id).pipe(
            catchError(err => {
              console.error('[CampaignDetail] Health API failed for promotion', p.id, err);
              return of(null);
            })
          ).subscribe(health => {
            if (health) {
              this.promotionHealth[p.id!] = health;
              console.log('[CampaignDetail] Health loaded for promotion', p.id, health);
            }
          });
        });
      },
      error: err => {
        console.error('[CampaignDetail] Failed to load promotions', err);
        this.promotions = [];
        this.promotionHealth = {};
        this.expiringCount = 0;
        this.isLoading = false;
      }
    });
  }

  loadExpiringSoon(days: number = 7): void {
    this.promotionService.getExpiringSoon(days).pipe(
      catchError(err => {
        console.error('[CampaignDetail] Expiring-soon API failed', err);
        return of([]);
      })
    ).subscribe(data => {
      const list = Array.isArray(data) ? data : [];
      console.log('[CampaignDetail] Expiring-soon raw list:', list);
      if (this.campaign?.id == null) {
        this.expiringCount = list.length;
        this.expiringPromotionCodes = list.map(p => String(p?.code ?? '')).filter(Boolean);
        return;
      }
      const filtered = list.filter(p => Number(p?.campaignId) === Number(this.campaign?.id));
      this.expiringCount = filtered.length;
      this.expiringPromotionCodes = filtered.map(p => String(p?.code ?? '')).filter(Boolean);
      console.log('[CampaignDetail] Expiring count for campaign', this.campaign.id, this.expiringCount);
    });
  }

  analyze(): void {
    if (!this.campaign) return;
    this.isAnalyzing = true;
    const request = {
      name: this.campaign.name,
      description: this.campaign.description,
      startDate: this.campaign.startDate,
      endDate: this.campaign.endDate,
      discountPercentages: this.promotions.map(p => p.discountPercentage)
    };

    this.campaignService.analyze(request).subscribe({
      next: (res) => {
        this.analysis = res;
        this.isAnalyzing = false;
      },
      error: () => this.isAnalyzing = false
    });
  }

  generatePromoCode(): void {
    if (!this.campaign?.id) return;
    this.promotionService.generateCode(this.campaign.id).subscribe(code => {
      this.editingPromotion.code = code;
    });
  }

  savePromotion(): void {
    if (!this.campaign?.id) return;
    const payload: Promotion = {
      code: String(this.editingPromotion.code ?? '').trim(),
      discountPercentage: Number(this.editingPromotion.discountPercentage),
      validFrom: this.formatDateForBackend(this.editingPromotion.validFrom),
      validUntil: this.formatDateForBackend(this.editingPromotion.validUntil),
      maxUses: Number(this.editingPromotion.maxUses),
      usedCount: this.editingPromotion.id ? Number(this.editingPromotion.usedCount ?? 0) : 0,
    };

    const obs = this.editingPromotion.id
      ? this.promotionService.update(this.editingPromotion.id, { ...payload, id: this.editingPromotion.id })
      : this.promotionService.create(payload, this.campaign.id);

    obs.subscribe({
      next: () => {
        this.loadPromotions(this.campaign!.id!);
        this.showPromoModal = false;
        this.editingPromotion = this.initPromo();
      },
      error: err => {
        console.error('[CampaignDetail] Failed to save promotion', err, payload);
        alert('Unable to save promotion. Please verify required fields and date format.');
      },
    });
  }

  editPromotion(p: Promotion): void {
    this.editingPromotion = {
      ...p,
      validFrom: this.toDatetimeLocalInputValue(p.validFrom),
      validUntil: this.toDatetimeLocalInputValue(p.validUntil),
    };
    this.showPromoModal = true;
  }

  deletePromotion(id: number): void {
    if (confirm('Supprimer cette promotion ?')) {
      this.promotionService.delete(id).subscribe(() => {
        this.promotions = this.promotions.filter(p => p.id !== id);
      });
    }
  }

  private initPromo(): Promotion {
    const now = new Date();
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return {
      code: '',
      discountPercentage: 10,
      validFrom: this.toDatetimeLocal(now),
      validUntil: this.toDatetimeLocal(in7Days),
      maxUses: 100,
      usedCount: 0
    };
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#3b82f6'; // Blue
    if (score >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  getPromotionHealthById(promotionId?: number): PromotionHealthDto | undefined {
    if (promotionId == null) return undefined;
    return this.promotionHealth[promotionId];
  }

  getPromotionCardClass(p: Promotion): string {
    const status = this.getPromotionHealthById(p.id)?.status?.toLowerCase() ?? 'healthy';
    return `health-${status}`;
  }

  getHealthBadgeClass(status: string | undefined): string {
    const normalized = String(status ?? '').toUpperCase();
    if (normalized === 'CRITICAL') return 'health-critical';
    if (normalized === 'AT_RISK') return 'health-at-risk';
    return 'health-healthy';
  }

  getExpiringTooltip(): string {
    if (!this.expiringPromotionCodes.length) return 'No expiring promotions';
    return `Expiring promotions: ${this.expiringPromotionCodes.join(', ')}`;
  }

  private formatDateForBackend(rawValue: string): string {
    const value = String(rawValue ?? '').trim();
    if (!value) return '';
    if (value.includes('T')) {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '';
      return this.toIsoSeconds(d);
    }
    const d = new Date(`${value}T00:00:00`);
    if (Number.isNaN(d.getTime())) return '';
    return this.toIsoSeconds(d);
  }

  private toIsoSeconds(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}:${s}`;
  }

  private toDatetimeLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}T${h}:${min}`;
  }

  private toDatetimeLocalInputValue(value: string): string {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return this.toDatetimeLocal(d);
  }
}
