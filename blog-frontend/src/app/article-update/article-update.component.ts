import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../service/article.service';
import { Article } from '../models/article.model';

@Component({
  selector: 'app-article-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './article-update.component.html',
  styleUrls: ['./article-update.component.css']
})
export class ArticleUpdateComponent implements OnInit {
  articleForm: FormGroup;
  articleId?: number;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      summary: ['', [Validators.maxLength(500)]],
      author: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', [Validators.required, Validators.maxLength(50)]],
      tags: ['', [Validators.maxLength(200)]],
      status: ['Brouillon', [Validators.required]]
    });
  }

  get f() {
    return this.articleForm.controls;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.articleId = +params['id'];
        this.loadArticle();
      }
    });
  }

  loadArticle() {
    this.loading = true;
    this.articleService.getById(this.articleId!).subscribe({
      next: (article: Article) => {
        this.articleForm.patchValue({
          title: article.title,
          content: article.content,
          summary: article.summary || '',
          author: article.author || '',
          category: article.category || '',
          tags: article.tags || '',
          status: article.status || 'Brouillon'
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.errorMessage = 'Impossible de charger l\'article.';
        this.loading = false;
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.articleForm.invalid) {
      return;
    }

    this.loading = true;
    const articleData: Article = this.articleForm.value;

    this.articleService.update(this.articleId!, articleData).subscribe({
      next: () => {
        console.log('Article modifié avec succès');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Erreur lors de la modification:', err);
        this.errorMessage = 'Erreur lors de la modification.';
        this.loading = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}