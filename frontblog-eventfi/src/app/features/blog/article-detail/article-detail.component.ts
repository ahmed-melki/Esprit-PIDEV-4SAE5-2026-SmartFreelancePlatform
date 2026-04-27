import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../services/blog.service';
import { ReactionService } from '../services/reaction.service';
import { Article, ReactionType } from '../models/blog.model';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './article-detail.component.html',
  styles: `
    .article-detail-container {
      min-height: 100vh;
      background: white;
      padding-bottom: 5rem;
    }

    .hero-section {
      background: linear-gradient(to bottom, #1e293b, #0f172a);
      color: white;
      padding: 6rem 2rem;
      text-align: center;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .article-meta {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #94a3b8;
    }

    .category-tag {
      color: #818cf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .title {
      font-size: 3rem;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 2.5rem;
      letter-spacing: -0.03em;
    }

    .author-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    .author-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #334155;
      border: 2px solid rgba(255,255,255,0.1);
    }

    .author-details {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      font-size: 0.9rem;
    }

    .name {
      font-weight: 700;
    }

    .date {
      color: #64748b;
    }

    .content-section {
      padding: 4rem 2rem;
      background: white;
    }

    .content-section .container {
      display: flex;
      gap: 4rem;
      max-width: 1100px;
      margin: 0 auto;
      text-align: left;
    }

    .main-content {
      flex: 1;
      min-width: 0;
    }

    .sidebar {
      width: 300px;
      flex-shrink: 0;
    }

    .badge-row {
      margin-bottom: 2rem;
    }

    .badge {
      display: inline-block;
      padding: 0.5rem 1.25rem;
      border-radius: 0.5rem;
      color: white;
      font-weight: 800;
      font-size: 0.8rem;
      text-transform: uppercase;
    }

    .article-body {
      font-size: 1.25rem;
      line-height: 1.8;
      color: #334155;
      margin-bottom: 4rem;
    }

    .no-content {
      padding: 2rem;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 1rem;
      color: #64748b;
      text-align: center;
    }

    .summary-lead {
      font-size: 1.4rem;
      font-weight: 600;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 2rem;
    }

    .main-body {
      font-size: 1.2rem;
      line-height: 1.8;
      color: #334155;
    }

    .no-content {
      padding: 3rem;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 1rem;
      color: #64748b;
      text-align: center;
    }

    .interaction-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 0;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
    }

    .reactions {
      display: flex;
      gap: 1rem;
    }

    .reaction-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      border-radius: 100px;
      border: 1px solid #e2e8f0;
      background: white;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .reaction-btn:hover {
      background: #f8fafc;
      transform: scale(1.05);
    }

    .reaction-btn.active.like {
      background: #ecfdf5;
      border-color: #10b981;
      color: #047857;
    }

    .reaction-btn.active.dislike {
      background: #fef2f2;
      border-color: #ef4444;
      color: #b91c1c;
    }

    .report-btn {
      padding: 0.75rem 1.25rem;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: color 0.2s;
    }

    .report-btn:hover {
      color: #ef4444;
    }

    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .report-modal {
      background: white;
      padding: 2.5rem;
      border-radius: 1.5rem;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .report-modal h2 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
    }

    .report-select {
      width: 100%;
      padding: 0.75rem;
      margin-bottom: 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }

    .report-textarea {
      width: 100%;
      height: 100px;
      padding: 0.75rem;
      margin-bottom: 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      resize: none;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-cancel {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      background: white;
      cursor: pointer;
    }

    .btn-submit {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      border: none;
      background: #ef4444;
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .loading-overlay {
      position: fixed;
      inset: 0;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f1f5f9;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
})
export class ArticleDetailComponent implements OnInit {
  article?: Article;
  isLoading = true;
  userReaction: ReactionType | null = null;
  
  // Reporting state
  showReportModal = false;
  reportReason = '';
  reportDescription = '';

  // Mocked viral for sidebar
  viralArticles: Article[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private reactionService: ReactionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadArticle(+id);
      }
    });
  }

  loadArticle(id: number): void {
    this.isLoading = true;
    console.log('--- Loading Article ID:', id);
    this.blogService.getById(id).subscribe({
      next: (data) => {
        console.log('--- Article Data Received:', data);
        this.article = data;
        this.checkUserReaction(id);
        this.loadRecommendations();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading article', err);
        this.isLoading = false;
      }
    });
  }

  checkUserReaction(articleId: number): void {
    this.reactionService.getUserReaction(articleId).subscribe(status => {
      this.userReaction = status.reactionType;
    });
  }

  onReaction(type: ReactionType): void {
    if (!this.article?.id) return;
    
    this.reactionService.toggleReaction(this.article.id, type).subscribe(res => {
      if (this.article) {
        this.article.likeCount = res.likeCount;
        this.article.dislikeCount = res.dislikeCount;
        this.article.badge = res.badge;
        this.article.badgeColor = res.badgeColor;
      }
      this.userReaction = res.currentUserReaction;
    });
  }

  loadRecommendations(): void {
    // In a real app, this would be a separate API call
    this.blogService.getAll().subscribe(all => {
      this.viralArticles = all.filter(a => a.likeCount >= 10 && a.id !== this.article?.id).slice(0, 3);
    });
  }

  openReportModal(): void {
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportReason = '';
    this.reportDescription = '';
  }

  submitReport(): void {
    if (!this.article?.id || !this.reportReason) return;

    this.blogService.report(this.article.id, {
      articleId: this.article.id,
      reason: this.reportReason,
      description: this.reportDescription
    }).subscribe({
      next: (res) => {
        alert(res.message);
        if (res.articleDeleted) {
          this.router.navigate(['/blog']);
        }
        this.closeReportModal();
      },
      error: (err) => {
        alert('Error submitting report: ' + (err.error?.error || 'Unknown error'));
        this.closeReportModal();
      }
    });
  }
}
