// src/app/services/quiz.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface Quiz {
  id?: number;
  title: string;
  description: string;
  job_Id: number;
  passingScore: number;
  timeLimitMinutes: number;
  isActive: boolean;
  questions?: Question[];
}

export interface Question {
  id?: number;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT';
  points: number;
  answers: Answer[];
}

export interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizResult {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8052/api/quizzes';

  constructor(private http: HttpClient) { }

  getQuizById(id: number): Observable<Quiz> {
    console.log(`📡 Appel API: ${this.apiUrl}/${id}`);
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  getQuizzesByJob(jobId: number): Observable<Quiz[]> {
    console.log(`📡 Appel API: ${this.apiUrl}/job/${jobId}`);
    return this.http.get<Quiz[]>(`${this.apiUrl}/job/${jobId}`);
  }

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz);
  }

  evaluateQuiz(quizId: number, userId: number, answers: any): Observable<QuizResult> {
    return this.http.post<QuizResult>(`${this.apiUrl}/${quizId}/evaluate?userId=${userId}`, answers);
  }

  hasUserTakenQuiz(quizId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${quizId}/taken/${userId}`);
  }

hasUserPassedQuiz(jobId: number, userId: number): Observable<boolean> {
  return this.getQuizzesByJob(jobId).pipe(
    switchMap(quizzes => {
      if (quizzes.length === 0) return of(false);
      const quizId = quizzes[0].id;
      if (!quizId) return of(false);
      return this.http.get<boolean>(`${this.apiUrl}/${quizId}/passed/${userId}`);
    }),
    catchError(() => of(false))
  );
}

  getAllQuizResults(quizId: number): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.apiUrl}/${quizId}/results`);
  }

}