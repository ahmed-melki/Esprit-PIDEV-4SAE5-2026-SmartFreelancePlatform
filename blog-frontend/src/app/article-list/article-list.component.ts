import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Article } from '../models/article.model';
import { ArticleService } from '../service/article.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  reportService: any;

  constructor(private service: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles() {
    this.service.getAll().subscribe({
      next: (data: Article[]) => {
        console.log('Articles reçus:', data);
        this.articles = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
      }
    });
  }

  deleteArticle(id: number) {
    if (confirm('Supprimer cet article ?')) {
      this.service.delete(id).subscribe({
        next: () => {
          console.log('Article supprimé avec succès');
          this.loadArticles(); // Recharger la liste
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
    }
  }

   report(articleId: number) {
    const article = this.articles.find(a => a.id === articleId);
    if(!article || !article.selectedReason) return;

    let reasonText = article.selectedReason;
    if(article.selectedReason === 'Autre' && article.comment) {
      reasonText += ': ' + article.comment;
    }

    this.reportService.reportArticle(articleId, reasonText)
      .subscribe({
        next: (msg: any) => {
          alert(msg);
          this.loadArticles(); // recharge liste articles et compteur
          article.selectedReason = '';
          article.comment = '';
        },
        error: (err: any) => {
          console.error('Erreur signalement', err);
          alert('Impossible de signaler l’article');
        }
      });
  }
}