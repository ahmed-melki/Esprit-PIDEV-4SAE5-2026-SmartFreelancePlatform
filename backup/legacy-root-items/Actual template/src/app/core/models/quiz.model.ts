export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id?: number;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  answers: Answer[];
  points: number;
}

export interface Quiz {
  id?: number;
  title: string;
  description?: string;
  job_Id?: number;          // mapped to jobOffer in backend
  passingScore: number;    // e.g. 70
  timeLimitMinutes?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  questions: Question[];
}

export interface QuizResult {
  id?: number;
  quiz?: Quiz;
  userId?: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt?: string;
}
