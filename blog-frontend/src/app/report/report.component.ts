import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Article } from '../models/article.model';
import { ArticleReport } from '../models/articleReport.model';
import { ArticleService } from '../service/article.service';
import { ReportService } from '../service/report.service';


@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  articleId: number | null = null;
  article: Article | null = null;
  isSubmitting = false;
  isLoaded = false;
  
  reportData: ArticleReport = {
    reason: '',
    description: '',
    reporterName: '',
    email: ''
  };

  reasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam or Misleading' },
    { value: 'harassment', label: 'Harassment or Bullying' },
    { value: 'hate-speech', label: 'Hate Speech' },
    { value: 'violence', label: 'Violent Content' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'other', label: 'Other' }
];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.articleId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.articleId) {
      this.loadArticle();
    }
  }

  loadArticle(): void {
    this.articleService.getById(this.articleId!).subscribe({
      next: (article: Article | null) => {
        this.article = article;
        this.isLoaded = true;
      },
      error: (error: any) => {
        console.error('Error loading article:', error);
        alert('Article non trouvé');
        this.router.navigate(['/']);
      }
    });
  }

  submitReport(): void {
    // Validation
    if (!this.reportData.reason) {
      alert('Veuillez sélectionner un motif');
      return;
    }
    
    if (!this.reportData.description || this.reportData.description.trim() === '') {
      alert('Veuillez fournir une description détaillée');
      return;
    }

    this.isSubmitting = true;

    // Préparer les données à envoyer
    const reportToSend: ArticleReport = {
      reason: this.reportData.reason,
      description: this.reportData.description,
      reporterName: this.reportData.reporterName || 'Anonyme',
      email: this.reportData.email || ''
    };

    this.reportService.reportArticle(this.articleId!, reportToSend).subscribe({
      next: (response: any) => {
        console.log('Report submitted:', response);
        alert(response.message || 'Merci pour votre signalement !');
        this.router.navigate(['articles']);
      },
      error: (error: { status: number; error: { error: string; }; }) => {
        console.error('Error submitting report:', error);
        let errorMessage = 'Erreur lors du signalement. ';
        
        if (error.status === 0) {
          errorMessage += 'Impossible de contacter le serveur.';
        } else if (error.status === 404) {
          errorMessage += 'Article non trouvé.';
        } else if (error.error && error.error.error) {
          errorMessage += error.error.error;
        } else {
          errorMessage += 'Veuillez réessayer.';
        }
        
        alert(errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  cancelReport(): void {
    this.router.navigate(['/articles']);
  }
}