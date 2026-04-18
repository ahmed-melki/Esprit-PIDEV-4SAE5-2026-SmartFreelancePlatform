import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, QuizResult } from '../models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8052/api/quizzes';

  constructor(private http: HttpClient) {}

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz);
  }

  getQuizzesByJob(jobId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/job/${jobId}`);
  }

  getQuizById(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  /** Check if user already took the quiz */
  hasUserTakenQuiz(quizId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${quizId}/taken/${userId}`);
  }

  /** Check if user PASSED the quiz (>= passingScore) */
  hasUserPassedQuiz(quizId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${quizId}/passed/${userId}`);
  }

  /** Submit quiz answers for evaluation */
  evaluateQuiz(quizId: number, userId: number, answers: { [questionId: number]: number[] }): Observable<QuizResult> {
    return this.http.post<QuizResult>(`${this.apiUrl}/${quizId}/evaluate?userId=${userId}`, answers);
  }

  /** Get the quiz result for a user */
  getQuizResult(quizId: number, userId: number): Observable<QuizResult> {
    return this.http.get<QuizResult>(`${this.apiUrl}/${quizId}/result/${userId}`);
  }
}
