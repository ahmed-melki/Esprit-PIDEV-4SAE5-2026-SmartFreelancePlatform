// src/app/quiz/quiz.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { QuizService, Quiz, QuizResult } from '../quiz/quiz.service';
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  currentQuestionIndex = 0;
  answers: Map<number, any> = new Map();
  loading = false;
  quizCompleted = false;
  result: QuizResult | null = null;
  userId = 1;
  timeRemaining = 0;
  timerInterval: any;

  constructor(
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id'));
    if (quizId) {
      this.loadQuiz(quizId);
    } else {
      this.snackBar.open('Quiz non trouvé', 'Fermer', { duration: 3000 });
      this.router.navigate(['/jobs']);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadQuiz(quizId: number): void {
    this.loading = true;
    this.quizService.getQuizById(quizId).subscribe({
      next: (data) => {
        this.quiz = data;
        console.log('📚 Quiz chargé:', this.quiz);
        console.log('📋 Questions:', this.quiz?.questions);
        if (data.timeLimitMinutes && data.timeLimitMinutes > 0) {
          this.timeRemaining = data.timeLimitMinutes * 60;
          this.startTimer();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.snackBar.open('Erreur lors du chargement du quiz', 'Fermer', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/jobs']);
      }
    });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.submitQuiz();
      }
    }, 1000);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  onAnswerChange(questionId: number, answerId: number, isMultiple: boolean): void {
    console.log(`📝 Réponse changée - Question: ${questionId}, Answer: ${answerId}, Multiple: ${isMultiple}`);
    
    if (isMultiple) {
      let currentAnswers = this.answers.get(questionId) || [];
      if (currentAnswers.includes(answerId)) {
        currentAnswers = currentAnswers.filter((id: number) => id !== answerId);
        console.log(`  ❌ Réponse retirée`);
      } else {
        currentAnswers.push(answerId);
        console.log(`  ✅ Réponse ajoutée`);
      }
      this.answers.set(questionId, currentAnswers);
      console.log(`  📊 Réponses actuelles:`, currentAnswers);
    } else {
      this.answers.set(questionId, [answerId]);
      console.log(`  ✅ Réponse unique sélectionnée: ${answerId}`);
    }
  }

  isAnswerSelected(questionId: number, answerId: number): boolean {
    const selected = this.answers.get(questionId);
    if (Array.isArray(selected)) {
      return selected.includes(answerId);
    }
    return false;
  }

  nextQuestion(): void {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questions!.length - 1) {
      this.currentQuestionIndex++;
      console.log(`➡️ Question suivante: ${this.currentQuestionIndex + 1}`);
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      console.log(`⬅️ Question précédente: ${this.currentQuestionIndex + 1}`);
    }
  }

  submitQuiz(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    const formattedAnswers: any = {};
    this.answers.forEach((value, key) => {
      formattedAnswers[key] = value;
    });
    
    // ✅ LOGS POUR DÉBOGUER
    console.log('========================================');
    console.log('=== ENVOI DES RÉPONSES ===');
    console.log('========================================');
    console.log('📌 Quiz ID:', this.quiz?.id);
    console.log('👤 User ID:', this.userId);
    console.log('📊 Réponses formatées:', JSON.stringify(formattedAnswers, null, 2));
    console.log('');
    
    // Afficher le détail des réponses
    console.log('=== DÉTAIL DES RÉPONSES ===');
    for (const [questionId, answerIds] of this.answers.entries()) {
      const question = this.quiz?.questions?.find(q => q.id === questionId);
      console.log(`\n📋 Question ${questionId}: ${question?.text}`);
      console.log(`  🎯 Réponses sélectionnées (IDs):`, answerIds);
      
      if (question?.answers) {
        const selectedAnswers = question.answers.filter(a => answerIds.includes(a.id!));
        selectedAnswers.forEach(a => console.log(`    ✅ ${a.text}`));
        
        const correctAnswers = question.answers.filter(a => a.isCorrect);
        console.log(`  🔑 Réponses correctes attendues:`, correctAnswers.map(a => a.text));
      }
    }
    console.log('========================================\n');
    
    this.loading = true;
    this.quizService.evaluateQuiz(this.quiz!.id!, this.userId, formattedAnswers).subscribe({
      next: (result) => {
        console.log('=== RÉSULTAT REÇU ===');
        console.log('Score:', result.score);
        console.log('Max score:', result.maxScore);
        console.log('Pourcentage:', result.percentage);
        console.log('Réussi:', result.passed);
        console.log('=====================\n');
        
        this.result = result;
        this.quizCompleted = true;
        this.loading = false;
        
        if (result.passed) {
          this.snackBar.open(`✅ Félicitations ! Score: ${result.percentage}%`, 'Fermer', { duration: 5000 });
        } else {
          this.snackBar.open(`❌ Score: ${result.percentage}% - Vous n'avez pas atteint le score requis`, 'Fermer', { duration: 5000 });
        }
      },
      error: (err) => {
        console.error('❌ ERREUR lors de l\'évaluation:', err);
        if (err.error) {
          console.error('Détails:', err.error);
        }
        this.snackBar.open('Erreur lors de l\'évaluation du quiz', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getProgress(): number {
    if (!this.quiz?.questions) return 0;
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }

  applyToJob(): void {
    this.router.navigate(['/jobs', this.quiz?.job_Id, 'apply']);
  }
}