import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-post-quiz',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-quiz.component.html',
  styleUrl: './post-quiz.component.css'
})
export class PostQuizComponent implements OnInit {
  jobId!: number;
  quizForm: FormGroup;
  isSubmitting = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.quizForm = this.fb.group({
      title: ['Qualification Quiz', Validators.required],
      description: [''],
      passingScore: [70, [Validators.required, Validators.min(1), Validators.max(100)]],
      timeLimitMinutes: [30],
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.addQuestion(); // Start with one question
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  addQuestion() {
    const questionGroup = this.fb.group({
      text: ['', Validators.required],
      type: ['SINGLE_CHOICE'],
      points: [10, [Validators.required, Validators.min(1)]],
      answers: this.fb.array([])
    });
    this.questions.push(questionGroup);
    // Start each question with 2 answer options
    const answersArray = questionGroup.get('answers') as FormArray;
    answersArray.push(this.newAnswer());
    answersArray.push(this.newAnswer());
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  newAnswer() {
    return this.fb.group({
      text: ['', Validators.required],
      isCorrect: [false]
    });
  }

  addAnswer(questionIndex: number) {
    this.getAnswers(questionIndex).push(this.newAnswer());
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    this.getAnswers(questionIndex).removeAt(answerIndex);
  }

  onSubmit() {
    if (this.quizForm.invalid) return;

    this.isSubmitting = true;
    this.submitError = '';
    const v = this.quizForm.value;

    const quiz = {
      title: v.title,
      description: v.description,
      passingScore: v.passingScore,
      timeLimitMinutes: v.timeLimitMinutes,
      job_Id: this.jobId,
      questions: v.questions.map((q: any) => ({
        text: q.text,
        type: q.type,
        points: q.points,
        answers: q.answers.map((a: any) => ({
          text: a.text,
          isCorrect: a.isCorrect
        }))
      }))
    };

    this.quizService.createQuiz(quiz).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/client/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.submitError = 'Failed to save quiz. Check the backend is running.';
      }
    });
  }
}
