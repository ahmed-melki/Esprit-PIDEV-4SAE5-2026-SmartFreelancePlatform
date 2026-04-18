import { JobOffer } from './job.model';

export interface Candidature {
  id?: number;
  jobOffer?: JobOffer;
  candidatId?: number;
  lettreMotivation?: string;
  cvUrl?: string;
  statut?: 'EN_ATTENTE' | 'EN_COURS_EXAMEN' | 'ENTRETIEN_PLANIFIE' | 'ENTRETIEN_REALISE' | 'ACCEPTEE' | 'REFUSEE';
  datePostulation?: string;
  commentaireRecruteur?: string;
}
