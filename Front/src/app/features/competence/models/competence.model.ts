export enum NiveauSkill {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  EXPERT = 'EXPERT'
}

export interface Skill {
  idSkill?: number;
  nomSkill: string;
  description: string;
  niveau: NiveauSkill;
  ratings?: Rating[];
}

export interface Rating {
  idRating?: number;
  note: number;
  commentaire: string;
  dateEvaluation?: string;
  skill?: Skill;
}

export interface StatistiquesGlobalesDto {
  totalCompetences: number;
  totalNotes: number;
  noteMoyenneGlobale: number;
  repartitionParNiveau: RepartitionNiveauDto[];
}

export interface RepartitionNiveauDto {
  niveau: NiveauSkill;
  total: number;
}

export interface StatistiqueCompetenceDto {
  idSkill: number;
  nomSkill: string;
  nombreNotes: number;
  noteMoyenne: number;
}
