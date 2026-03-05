export enum NiveauSkill {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  EXPERT = 'EXPERT'
}

export interface Rating {
  idRating?: number;
  note: number;
  commentaire: string;
  dateEvaluation?: Date;
  skill?: Skill;
}

export interface Skill {
  idSkill?: number;
  nomSkill: string;
  description: string;
  niveau: NiveauSkill;
  ratings?: Rating[];
}
