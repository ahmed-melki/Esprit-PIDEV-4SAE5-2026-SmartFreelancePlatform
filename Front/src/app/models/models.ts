export interface Certification {
  id?: number;
  certificateNumber: string;
  issueDate: string | null;
  expiryDate: string | null;
  status: string | null;
  grade: string;
  score: number | null;
  clientId?: number;
  training?: Training;
}

export interface Training {
  id?: number;
  title: string;
  description: string;
  category: string;
  durationHours: number | null;
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  certifications?: Certification[];
}

export interface Title {
  id?: number;
  name: string;
  description: string;
  iconName: string;
  requiredTrainingCount?: number;
  requiredCategories?: string;
  requiredTrainingIds?: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  isActive: boolean;
}

export interface UserTitle {
  id?: number;
  clientId: number;
  title: Title;
  unlockedAt: string;
  unlockSource: 'TRAINING_COMPLETION' | 'ADMIN_GRANT' | 'SYSTEM_AWARD';
}
