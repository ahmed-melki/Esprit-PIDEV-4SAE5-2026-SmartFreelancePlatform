import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Article } from '../models/blog.model';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './article-form.component.html',
  styles: `
    .form-container {
      max-width: 800px;
      margin: 4rem auto;
      padding: 3rem;
      background: white;
      border-radius: 2rem;
      box-shadow: 0 20px 50px rgba(0,0,0,0.05);
      border: 1px solid #f1f5f9;
    }

    .form-header {
      margin-bottom: 2.5rem;
    }

    .form-header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
    }

    .premium-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-size: 0.875rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-control {
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      font-size: 1rem;
      color: #1e293b;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .content-area {
      min-height: 300px;
      resize: vertical;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #f1f5f9;
    }

    .btn {
      padding: 0.75rem 2rem;
      border-radius: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #1e293b;
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background: #0f172a;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background: #f8fafc;
    }

    .error-msg {
      font-size: 0.75rem;
      color: #ef4444;
      font-weight: 600;
    }
  `
})
export class ArticleFormComponent implements OnInit {
  articleForm: FormGroup;
  isEditMode = false;
  articleId?: number;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      summary: ['', [Validators.required, Validators.maxLength(255)]],
      author: ['', Validators.required],
      category: ['', Validators.required],
      content: ['', [Validators.required, Validators.minLength(20)]],
      tags: [''],
      status: ['published']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.articleId = +id;
      this.loadArticle(this.articleId);
    }
  }

  loadArticle(id: number): void {
    this.isLoading = true;
    this.blogService.getById(id).subscribe({
      next: (article) => {
        this.articleForm.patchValue(article);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading article', err);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.articleForm.invalid) return;

    this.isLoading = true;
    const articleData = this.articleForm.value;

    if (this.isEditMode && this.articleId) {
      this.blogService.update(this.articleId, articleData).subscribe({
        next: () => {
          this.router.navigate(['/blog', this.articleId]);
        },
        error: (err) => {
          console.error('Error updating article', err);
          this.isLoading = false;
        }
      });
    } else {
      this.blogService.create(articleData).subscribe({
        next: (res) => {
          this.router.navigate(['/blog', res.id]);
        },
        error: (err) => {
          console.error('Error creating article', err);
          this.isLoading = false;
        }
      });
    }
  }
}
