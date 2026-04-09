import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Article } from '../../models/article.model';
import { ArticleService } from '../../service/article.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadArticle(id);
    } else {
      this.error = 'Article non trouvé';
      this.isLoading = false;
    }
  }

  loadArticle(id: number): void {
    this.articleService.getById(id).subscribe({
      next: (article: Article | null) => {
        this.article = article;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading article:', err);
        this.error = 'Impossible de charger l\'article';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }
}