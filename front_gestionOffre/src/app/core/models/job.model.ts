export interface JobOffer {
  id?: number;
  title: string;
  description?: string;
  company: string;
  location?: string;
  contractType?: 'CDI' | 'CDD' | 'STAGE' | 'FREELANCE';
  salaryMin?: number;
  salaryMax?: number;
  requiredSkills?: string[];
  experienceLevel?: string;
  educationLevel?: string;
  deadline?: string;
  numberOfPositions?: number;
  status?: 'OPEN' | 'CLOSED' | 'DRAFT';
  createdAt?: string;
  updatedAt?: string;
  employerId?: number;
  remotePossible?: boolean;
  benefits?: string;
  applicantIds?: number[];
}
