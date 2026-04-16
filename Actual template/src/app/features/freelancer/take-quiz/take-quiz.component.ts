import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz, QuizResult } from '../../../core/models/quiz.model';

const MOCK_FREELANCER_ID = 1; // Replace with real auth session user ID later

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './take-quiz.component.html',
  styleUrl: './take-quiz.component.css'
})
export class TakeQuizComponent implements OnInit {
  jobId!: number;
  quiz: Quiz | null = null;
  loading = true;
  error = '';

  /** Stores user selected answer IDs per question index (for SINGLE: one id; MULTIPLE: many) */
  selectedAnswers: { [questionIndex: number]: number[] } = {};

  submitted = false;
  result: QuizResult | null = null;
  alreadyPassed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));

    // 1. Fetch quiz for this job
    this.quizService.getQuizzesByJob(this.jobId).subscribe({
      next: (quizzes) => {
        if (!quizzes || quizzes.length === 0) {
          this.error = 'No quiz found for this job.';
          this.loading = false;
          return;
        }
        this.quiz = quizzes[0];

        // 2. Check if user already passed
        this.quizService.hasUserPassedQuiz(this.quiz.id!, MOCK_FREELANCER_ID).subscribe({
          next: (passed) => {
            this.alreadyPassed = passed;
            this.loading = false;
          },
          error: () => { this.loading = false; }
        });
      },
      error: (err) => {
        this.error = 'Could not load quiz. Ensure backend is running on port 8052.';
        this.loading = false;
      }
    });
  }

  toggleAnswer(questionIndex: number, answerId: number, type: string) {
    if (!this.selectedAnswers[questionIndex]) {
      this.selectedAnswers[questionIndex] = [];
    }

    if (type === 'SINGLE_CHOICE') {
      this.selectedAnswers[questionIndex] = [answerId];
    } else {
      const idx = this.selectedAnswers[questionIndex].indexOf(answerId);
      if (idx === -1) {
        this.selectedAnswers[questionIndex].push(answerId);
      } else {
        this.selectedAnswers[questionIndex].splice(idx, 1);
      }
    }
  }

  isSelected(questionIndex: number, answerId: number): boolean {
    return (this.selectedAnswers[questionIndex] || []).includes(answerId);
  }

  submitQuiz() {
    if (!this.quiz) return;

    // Build the answers map: questionId → [answerIds]
    const answersPayload: { [questionId: number]: number[] } = {};
    this.quiz.questions.forEach((q, idx) => {
      answersPayload[q.id!] = this.selectedAnswers[idx] || [];
    });

    this.quizService.evaluateQuiz(this.quiz.id!, MOCK_FREELANCER_ID, answersPayload).subscribe({
      next: (result) => {
        this.result = result;
        this.submitted = true;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to submit quiz. Please try again.';
      }
    });
  }

  goApply() {
    this.router.navigate(['/freelancer/apply', this.jobId]);
  }
}
