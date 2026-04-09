// src/app/jobs/quiz-dialog/quiz-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QuizService, Quiz, Question, Answer } from '../../quiz/quiz.service';

@Component({
  selector: 'app-quiz-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './quiz-dialog.component.html',
  styleUrls: ['./quiz-dialog.component.css']
})
export class QuizDialogComponent {
  quiz: Quiz = {
    title: '',
    description: '',
     job_Id: 0,
    passingScore: 70,
    timeLimitMinutes: 10,
    isActive: true,
    questions: []
  };
  job: any;

  constructor(
    private dialogRef: MatDialogRef<QuizDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: any },
    private quizService: QuizService,
    private snackBar: MatSnackBar
  ) {
    this.job = data.job;
  this.quiz.job_Id = this.job.id; // ✅ Vérifier que this.job.id existe
  console.log('Job ID reçu:', this.job.id);
  console.log('Quiz initialisé:', this.quiz);

  }

  addQuestion(): void {
    this.quiz.questions = this.quiz.questions || [];
    this.quiz.questions.push({
      text: '',
      type: 'SINGLE_CHOICE',
      points: 10,
      answers: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
  }

  removeQuestion(index: number): void {
    if (this.quiz.questions && this.quiz.questions.length > index) {
      this.quiz.questions.splice(index, 1);
    }
  }

  addAnswer(questionIndex: number): void {
    if (!this.quiz.questions || !this.quiz.questions[questionIndex]) return;
    
    if (!this.quiz.questions[questionIndex].answers) {
      this.quiz.questions[questionIndex].answers = [];
    }
    this.quiz.questions[questionIndex].answers.push({ text: '', isCorrect: false });
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    if (this.quiz.questions && 
        this.quiz.questions[questionIndex] && 
        this.quiz.questions[questionIndex].answers &&
        this.quiz.questions[questionIndex].answers.length > answerIndex) {
      this.quiz.questions[questionIndex].answers.splice(answerIndex, 1);
    }
  }

  isValid(): boolean {
    if (!this.quiz.title) return false;
    if (!this.quiz.questions || this.quiz.questions.length === 0) return false;
    
    for (const question of this.quiz.questions) {
      if (!question.text) return false;
      if (!question.answers || question.answers.length < 2) return false;
      
      let hasCorrectAnswer = false;
      for (const answer of question.answers) {
        if (!answer.text) return false;
        if (answer.isCorrect) hasCorrectAnswer = true;
      }
      if (!hasCorrectAnswer) return false;
    }
    
    return true;
  }

 save(): void {
  // Vérifier que les réponses correctes sont bien marquées
  console.log('=== VÉRIFICATION DES RÉPONSES CORRECTES ===');
  this.quiz.questions?.forEach((question, qIndex) => {
    console.log(`Question ${qIndex + 1}: ${question.text}`);
    question.answers?.forEach((answer, aIndex) => {
      console.log(`  Réponse ${aIndex + 1}: "${answer.text}" - isCorrect: ${answer.isCorrect}`);
    });
  });
  
  console.log('Envoi du quiz:', JSON.stringify(this.quiz, null, 2));
  const quizToSend = this.quiz;
  
  this.quizService.createQuiz(quizToSend).subscribe({
    next: (response) => {
      console.log('Quiz créé:', response);
      this.snackBar.open('Quiz publié avec succès !', 'Fermer', { duration: 3000 });
      this.dialogRef.close(true);
    },
    error: (err: any) => {
      console.error('Erreur détaillée:', err);
      this.snackBar.open('Erreur: ' + (err.error?.message || 'Publication échouée'), 'Fermer', { duration: 5000 });
    }
  });
}

  cancel(): void {
    this.dialogRef.close(false);
  }
}