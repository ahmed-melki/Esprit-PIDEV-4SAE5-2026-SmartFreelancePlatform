import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ArticleListComponent } from './article-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlogService } from '../services/blog.service';
import { of, throwError } from 'rxjs';
import { Article } from '../models/blog.model';
import { FormsModule } from '@angular/forms';

describe('ArticleListComponent', () => {
  let component: ArticleListComponent;
  let fixture: ComponentFixture<ArticleListComponent>;
  let blogService: BlogService;

  const mockArticles: Article[] = [
    { id: 1, title: 'Angular Testing', summary: 'Summary 1', content: '...', author: 'John', category: 'Tech', reportCount: 0, likeCount: 5, dislikeCount: 0 },
    { id: 2, title: 'Java Guide', summary: 'Summary 2', content: '...', author: 'Doe', category: 'Backend', reportCount: 0, likeCount: 10, dislikeCount: 1 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleListComponent, HttpClientTestingModule, RouterTestingModule, FormsModule],
      providers: [
        {
          provide: BlogService,
          useValue: {
            getAll: () => of(mockArticles)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent);
    component = fixture.componentInstance;
    blogService = TestBed.inject(BlogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load articles on init', () => {
    expect(component.articles.length).toBe(2);
    expect(component.isLoading).toBeFalse();
  });

  it('should filter articles by search term', () => {
    component.searchTerm = 'Angular';
    component.filterArticles();
    expect(component.filteredArticles.length).toBe(1);
    expect(component.filteredArticles[0].title).toBe('Angular Testing');
  });

  it('should filter articles by category', () => {
    component.selectedCategory = 'Backend';
    component.filterArticles();
    expect(component.filteredArticles.length).toBe(1);
    expect(component.filteredArticles[0].category).toBe('Backend');
  });

  it('should extract categories from articles', () => {
    expect(component.categories).toContain('Tech');
    expect(component.categories).toContain('Backend');
    expect(component.categories).toContain('All');
  });

  it('should show empty state when no articles match', () => {
    component.searchTerm = 'NonExistent';
    component.filterArticles();
    expect(component.filteredArticles.length).toBe(0);
  });
});
