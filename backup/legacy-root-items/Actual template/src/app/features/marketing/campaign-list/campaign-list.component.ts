import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CampaignService } from '../services/campaign.service';
import { Campaign, CampaignAnalysisResult, CampaignStatus } from '../models/marketing.model';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaign-list.component.html',
  styleUrl: './campaign-list.component.css'
})
export class CampaignListComponent implements OnInit {
  readonly campaignStatusFilterOptions: Array<'' | 'PENDING' | 'ACTIVE' | 'EXPIRED'> = [
    '',
    'PENDING',
    'ACTIVE',
    'EXPIRED',
  ];

  campaigns: Campaign[] = [];
  isLoading = true;
  searchTerm = '';
  statusFilter: '' | 'PENDING' | 'ACTIVE' | 'EXPIRED' = '';
  showCreateModal = false;
  isAnalyzingNewCampaign = false;
  newCampaignAnalysis?: CampaignAnalysisResult;
  newCampaignAnalyzeError = '';
  draftDiscount: number | null = null;
  analyzeDiscounts: number[] = [];

  newCampaign: Campaign = {
    name: '',
    description: '',
    startDate: this.toDatetimeLocal(new Date()),
    endDate: this.toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    status: CampaignStatus.PLANNED
  };

  constructor(private campaignService: CampaignService) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.campaignService.getAll().subscribe({
      next: (res) => {
        this.campaigns = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading campaigns', err);
        this.isLoading = false;
      }
    });
  }

  get filteredCampaigns(): Campaign[] {
    return this.campaigns.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = !this.statusFilter || this.getCampaignStatus(c) === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  duplicate(id: number): void {
    this.campaignService.duplicate(id).subscribe({
      next: (copy) => {
        this.campaigns.unshift(copy);
        // Optional: toast notification
      }
    });
  }

  deleteCampaign(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      this.campaignService.delete(id).subscribe({
        next: () => {
          this.campaigns = this.campaigns.filter(c => c.id !== id);
        }
      });
    }
  }

  onSubmit(): void {
    const payload: Campaign = {
      ...this.newCampaign,
      // Keep backend compatibility while UI status is computed dynamically.
      status: CampaignStatus.PLANNED,
      startDate: this.formatDateForBackend(this.newCampaign.startDate),
      endDate: this.formatDateForBackend(this.newCampaign.endDate),
    };

    this.campaignService.create(payload).subscribe({
      next: (created) => {
        this.campaigns.unshift(created);
        this.showCreateModal = false;
        this.resetForm();
      }
    });
  }

  resetForm(): void {
    this.newCampaign = {
      name: '',
      description: '',
      startDate: this.toDatetimeLocal(new Date()),
      endDate: this.toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      status: CampaignStatus.PLANNED
    };
    this.analyzeDiscounts = [];
    this.draftDiscount = null;
    this.newCampaignAnalyzeError = '';
    this.newCampaignAnalysis = undefined;
  }

  getStatusClass(status: 'PENDING' | 'ACTIVE' | 'EXPIRED'): string {
    return `status-${status.toLowerCase()}`;
  }

  getCampaignStatus(campaign: Campaign): 'PENDING' | 'ACTIVE' | 'EXPIRED' {
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);
    const now = new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'PENDING';
    if (now.getTime() < start.getTime()) return 'PENDING';
    if (now.getTime() > end.getTime()) return 'EXPIRED';
    return 'ACTIVE';
  }

  addAnalyzeDiscount(): void {
    const n = Number(this.draftDiscount);
    if (!Number.isFinite(n)) return;
    const rounded = Math.round(n * 10) / 10;
    if (rounded < 0 || rounded > 100) return;
    this.analyzeDiscounts = [...this.analyzeDiscounts, rounded];
    this.draftDiscount = null;
  }

  removeAnalyzeDiscount(index: number): void {
    this.analyzeDiscounts = this.analyzeDiscounts.filter((_, i) => i !== index);
  }

  canAnalyzeNewCampaign(): boolean {
    return this.canSaveNewCampaign();
  }

  canSaveNewCampaign(): boolean {
    return (
      !!this.newCampaign.name?.trim() &&
      !!this.newCampaign.startDate &&
      !!this.newCampaign.endDate &&
      !this.isStartDateInPast() &&
      this.isDateRangeValid()
    );
  }

  isStartDateInPast(): boolean {
    if (!this.newCampaign.startDate) return false;
    const start = new Date(this.newCampaign.startDate);
    if (Number.isNaN(start.getTime())) return false;
    return start.getTime() < Date.now();
  }

  isDateRangeValid(): boolean {
    if (!this.newCampaign.startDate || !this.newCampaign.endDate) return false;
    const start = new Date(this.newCampaign.startDate);
    const end = new Date(this.newCampaign.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
    return end.getTime() >= start.getTime();
  }

  analyzeNewCampaign(): void {
    if (!this.canAnalyzeNewCampaign() || this.isAnalyzingNewCampaign) return;
    this.isAnalyzingNewCampaign = true;
    this.newCampaignAnalyzeError = '';
    this.newCampaignAnalysis = undefined;

    this.campaignService.analyze({
      name: this.newCampaign.name.trim(),
      description: this.newCampaign.description ?? '',
      startDate: this.formatDateForBackend(this.newCampaign.startDate),
      endDate: this.formatDateForBackend(this.newCampaign.endDate),
      discountPercentages: [...this.analyzeDiscounts],
    }).subscribe({
      next: res => {
        this.newCampaignAnalysis = res;
        this.isAnalyzingNewCampaign = false;
      },
      error: err => {
        console.error('[CampaignList] Analyze campaign failed', err);
        this.newCampaignAnalyzeError = 'Analyzer is unavailable. Please verify the analytics backend.';
        this.isAnalyzingNewCampaign = false;
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  private formatDateForBackend(rawValue: string): string {
    const value = String(rawValue ?? '').trim();
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
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
}
