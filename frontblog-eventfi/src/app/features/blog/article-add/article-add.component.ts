import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Article } from '../models/blog.model';

@Component({
  selector: 'app-article-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './article-add.component.html',
  styleUrls: ['./article-add.component.css']
})
export class ArticleAddComponent {
  articleForm: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private router: Router
  ) {
    // Initialisation du formulaire
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(200)]],
      summary: ['', [Validators.maxLength(500)]],
      author: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', [Validators.required, Validators.maxLength(50)]],
      tags: ['', [Validators.maxLength(200)]],
      status: ['Brouillon', [Validators.required]]
    });
  }

  // Getters pour faciliter l'accès aux champs du formulaire
  get f() {
    return this.articleForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    // Arrêter si le formulaire est invalide
    if (this.articleForm.invalid) {
      return;
    }

    this.loading = true;

    const articleData: Article = this.articleForm.value;

    this.blogService.create(articleData).subscribe({
      next: () => {
        console.log('Article créé avec succès');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.errorMessage = 'Erreur lors de la création de l\'article. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  // Annuler et retourner à la liste
  onCancel() {
    this.router.navigate(['/']);
  }
}