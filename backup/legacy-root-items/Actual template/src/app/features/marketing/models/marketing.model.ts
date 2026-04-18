export enum CampaignStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED'
}

export interface Campaign {
  id?: number;
  name: string;
  description: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  status: CampaignStatus;
  promotions?: Promotion[];
}

export interface Promotion {
  id?: number;
  code: string;
  discountPercentage: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
  campaignId?: number;
}

export interface PromotionHealthDto {
  status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
  usageRate: string;
  daysRemaining: number;
  recommendation: string;
}

export interface CampaignAnalysisRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountPercentages: number[];
}

export interface CampaignAnalysisResult {
  successScore: number;
  scoreLabel: string; // "Excellent", "Good", "Average", "Poor"
  averageDiscount: number;
  durationDays: number;
  promotionCount: number;
  warnings: string[];
  suggestions: string[];
}

export interface CampaignStatisticsResult {
  totalCampaigns: number;
  totalPromotions: number;
  averageDiscountAcrossAll: number;
  averageDurationDays: number;
  campaignsByStatus: { [key: string]: number };
  mostGenerousPromoCode: string;
  highestDiscount: number;
  campaignWithMostPromotions: string;
  maxPromotionCount: number;
}
