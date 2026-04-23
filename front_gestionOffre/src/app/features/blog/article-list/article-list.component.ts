import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogService } from '../services/blog.service';
import { Article } from '../models/blog.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './article-list.component.html',
  styles: `
    .blog-container {
      padding: 4rem 2rem;
      max-width: 1280px;
      margin: 0 auto;
      background: #fdfdff;
      min-height: 100vh;
    }

    .header-section {
      text-align: center;
      margin-bottom: 4rem;
    }

    .header-section h1 {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1.5rem;
    }

    .search-filter-bar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 3rem;
      padding: 2rem;
      background: white;
      border-radius: 1.5rem;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
    }

    .search-input {
      width: 100%;
      padding: 1rem 1.5rem;
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .category-chips {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .chip {
      padding: 0.6rem 1.25rem;
      background: #f1f5f9;
      color: #475569;
      border-radius: 100px;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .chip:hover {
      background: #e2e8f0;
    }

    .chip.active {
      background: #1e293b;
      color: white;
    }

    .article-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 2.5rem;
    }

    .article-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 2.5rem;
      transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .article-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #6366f1, #a855f7);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .article-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.1);
      border-color: rgba(99, 102, 241, 0.2);
    }

    .article-card:hover::before {
      opacity: 1;
    }

    .badge-container {
      position: absolute;
      top: -12px;
      right: 20px;
    }

    .badge {
      padding: 6px 14px;
      font-size: 0.7rem;
      font-weight: 800;
      border-radius: 6px;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .article-category {
      color: #6366f1;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    .article-title {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.25;
      color: #0f172a;
      margin-bottom: 1rem;
    }

    .article-summary {
      color: #475569;
      line-height: 1.6;
      font-size: 0.95rem;
      margin-bottom: 2rem;
      flex-grow: 1;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid #f1f5f9;
    }

    .author-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .author-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      border-radius: 50%;
    }

    .author-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
    }

    .stats {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: #64748b;
    }

    .btn-read {
      margin-top: 1.5rem;
      width: 100%;
      padding: 1rem;
      background: #f8fafc;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-read:hover {
      background: #1e293b;
      color: white;
      border-color: #1e293b;
    }

    .btn-create {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 100px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-top: 1rem;
    }

    .btn-create:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 20px 30px -10px rgba(99, 102, 241, 0.5);
    }
  `
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCategory = 'All';
  categories: string[] = ['All'];
  errorMessage: string | null = null;

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.blogService.getAll().subscribe({
      next: (data) => {
        this.articles = data;
        this.filteredArticles = data;
        this.extractCategories(data);
        this.isLoading = false;
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error loading articles', err);
        this.isLoading = false;
        this.errorMessage = 'Impossible de charger les articles. Le service blog est peut-être hors ligne.';
      }
    });
  }

  extractCategories(articles: Article[]): void {
    const cats = new Set(articles.map(a => a.category));
    this.categories = ['All', ...Array.from(cats)];
  }

  filterArticles(): void {
    this.filteredArticles = this.articles.filter(a => {
      const matchesSearch = (a.title?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) ?? false) ||
                          (a.summary?.toLowerCase()?.includes(this.searchTerm.toLowerCase()) ?? false);
      const matchesCategory = this.selectedCategory === 'All' || a.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterArticles();
  }
}
