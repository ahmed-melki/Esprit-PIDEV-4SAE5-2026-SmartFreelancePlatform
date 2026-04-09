// article-listfront.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Article } from '../models/article.model';
import { ArticleService } from '../service/article.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './article-listfront.component.html',
  styleUrls: ['./article-listfront.component.css']
})
export class ArticleListfrontComponent implements OnInit {
  articles: Article[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  animatingArticleId: number | null = null;
  animatingType: 'LIKE' | 'DISLIKE' | null = null;
  
  // Pour le signalement
  showReportModal: boolean = false;
  selectedArticleId: number | null = null;
  selectedReason: string = '';
  reportComment: string = '';

  constructor(private service: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  // Charger tous les articles
  loadArticles(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data: Article[]) => {
        console.log('Articles reçus:', data);
        // Initialiser les champs manquants
        this.articles = data.map(article => ({
          ...article,
          likeCount: article.likeCount || 0,
          dislikeCount: article.dislikeCount || 0,
          currentUserReaction: '',
          badge: null,
          badgeColor: null,
          netScore: (article.likeCount || 0) - (article.dislikeCount || 0)
        }));
        this.loadUserReactions();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.loading = false;
      }
    });
  }

  // Charger les réactions de l'utilisateur pour chaque article
  loadUserReactions(): void {
    this.articles.forEach(article => {
      this.service.getUserReaction(article.id).subscribe({
        next: (response: any) => {
          article.currentUserReaction = response.reactionType;
          article.badge = response.badge;
          article.badgeColor = response.badgeColor;
        },
        error: (err: any) => console.error('Erreur chargement réaction:', err)
      });
    });
  }

  // Action Like
  onLike(article: Article): void {
    if (this.loading || this.animatingArticleId === article.id) return;
    
    this.animatingArticleId = article.id;
    this.animatingType = 'LIKE';
    
    this.service.toggleReaction(article.id, 'LIKE').subscribe({
      next: (response: any) => {
        article.likeCount = response.likeCount;
        article.dislikeCount = response.dislikeCount;
        article.currentUserReaction = response.currentUserReaction;
        article.badge = response.badge;
        article.badgeColor = response.badgeColor;
        article.netScore = response.likeCount - response.dislikeCount;
        
        setTimeout(() => {
          this.animatingArticleId = null;
          this.animatingType = null;
        }, 300);
      },
      error: (err: any) => {
        console.error('Erreur like:', err);
        this.animatingArticleId = null;
        this.animatingType = null;
      }
    });
  }

  // Action Dislike
  onDislike(article: Article): void {
    if (this.loading || this.animatingArticleId === article.id) return;
    
    this.animatingArticleId = article.id;
    this.animatingType = 'DISLIKE';
    
    this.service.toggleReaction(article.id, 'DISLIKE').subscribe({
      next: (response: any) => {
        article.likeCount = response.likeCount;
        article.dislikeCount = response.dislikeCount;
        article.currentUserReaction = response.currentUserReaction;
        article.badge = response.badge;
        article.badgeColor = response.badgeColor;
        article.netScore = response.likeCount - response.dislikeCount;
        
        setTimeout(() => {
          this.animatingArticleId = null;
          this.animatingType = null;
        }, 300);
      },
      error: (err: any) => {
        console.error('Erreur dislike:', err);
        this.animatingArticleId = null;
        this.animatingType = null;
      }
    });
  }

  // Supprimer un article
  deleteArticle(id: number): void {
    if (confirm('Supprimer cet article ?')) {
      this.service.delete(id).subscribe({
        next: () => {
          console.log('Article supprimé avec succès');
          this.loadArticles();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

  // Ouvrir le modal de signalement
  openReportModal(articleId: number): void {
    this.selectedArticleId = articleId;
    this.selectedReason = '';
    this.reportComment = '';
    this.showReportModal = true;
  }

  // Fermer le modal
  closeReportModal(): void {
    this.showReportModal = false;
    this.selectedArticleId = null;
    this.selectedReason = '';
    this.reportComment = '';
  }

  // Signaler un article
  reportArticle(): void {
    if (!this.selectedArticleId || !this.selectedReason) {
      alert('Veuillez sélectionner une raison');
      return;
    }

    let reasonText = this.selectedReason;
    if (this.selectedReason === 'Autre' && this.reportComment) {
      reasonText += ': ' + this.reportComment;
    }

    this.service.reportArticle(this.selectedArticleId, reasonText).subscribe({
      next: (response: any) => {
        alert(response.message || 'Article signalé avec succès');
        this.closeReportModal();
        this.loadArticles(); // Recharger pour mettre à jour le compteur
      },
      error: (err: any) => {
        console.error('Erreur signalement:', err);
        alert('Impossible de signaler l\'article');
      }
    });
  }

  // Filtrer les articles par recherche
  getFilteredArticles(): Article[] {
    if (!this.searchTerm) return this.articles;
    return this.articles.filter(article =>
      article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (article.author && article.author.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (article.category && article.category.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  // Calculer le pourcentage de likes
  getLikePercentage(article: Article): number {
    const total = (article.likeCount || 0) + (article.dislikeCount || 0);
    if (total === 0) return 0;
    return ((article.likeCount || 0) / total) * 100;
  }

  // Calculer le score net
  getNetScore(article: Article): number {
    return (article.likeCount || 0) - (article.dislikeCount || 0);
  }

  // Obtenir la couleur du score
  getScoreColor(article: Article): string {
    const score = this.getNetScore(article);
    if (score > 10) return '#27ae60';
    if (score > 0) return '#229954';
    if (score < 0) return '#e74c3c';
    return '#7f8c8d';
  }

  // Vérifier si l'utilisateur a liké
  isLiked(article: Article): boolean {
    return article.currentUserReaction === 'LIKE';
  }

  // Vérifier si l'utilisateur a disliké
  isDisliked(article: Article): boolean {
    return article.currentUserReaction === 'DISLIKE';
  }

  // Vérifier si l'article est en animation
  isAnimating(article: Article, type: 'LIKE' | 'DISLIKE'): boolean {
    return this.animatingArticleId === article.id && this.animatingType === type;
  }
}