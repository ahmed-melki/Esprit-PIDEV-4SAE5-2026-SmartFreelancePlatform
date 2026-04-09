import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ArticleListfrontComponent } from './article-listfront.component';
import { ArticleService } from '../service/article.service';
import { Article } from '../models/article.model';

describe('ArticleListfrontComponent', () => {
  let component: ArticleListfrontComponent;
  let fixture: ComponentFixture<ArticleListfrontComponent>;
  let articleServiceSpy: jasmine.SpyObj<ArticleService>;

  const mockArticles: Article[] = [
    {
      id: 1,
      title: 'Article Test 1',
      content: 'Content 1',
      author: 'Author 1',
      category: 'Technology',
      likeCount: 10,
      dislikeCount: 2,
      currentUserReaction: '',
      badge: null,
      badgeColor: null,
      netScore: 8
    },
    {
      id: 2,
      title: 'Article Test 2',
      content: 'Content 2',
      author: 'Author 2',
      category: 'Science',
      likeCount: 5,
      dislikeCount: 1,
      currentUserReaction: '',
      badge: null,
      badgeColor: null,
      netScore: 4
    }
  ];

  const mockReactionResponse = {
    likeCount: 11,
    dislikeCount: 2,
    currentUserReaction: 'LIKE',
    badge: '🔥 POPULAR',
    badgeColor: '#e67e22'
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ArticleService', [
      'getAll',
      'getUserReaction',
      'toggleReaction',
      'delete',
      'reportArticle'
    ]);

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule, FormsModule, ArticleListfrontComponent],
      providers: [
        { provide: ArticleService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleListfrontComponent);
    component = fixture.componentInstance;
    articleServiceSpy = TestBed.inject(ArticleService) as jasmine.SpyObj<ArticleService>;
    
    // Configuration par défaut des mocks
    articleServiceSpy.getAll.and.returnValue(of([...mockArticles]));
    articleServiceSpy.getUserReaction.and.returnValue(of({ reactionType: null, badge: null, badgeColor: null }));
    articleServiceSpy.toggleReaction.and.returnValue(of(mockReactionResponse));
    articleServiceSpy.delete.and.returnValue(of(void 0));
    articleServiceSpy.reportArticle.and.returnValue(of({ message: 'Reported successfully' }));
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.articles).toEqual([]);
      expect(component.searchTerm).toBe('');
      expect(component.loading).toBeFalse();
      expect(component.showReportModal).toBeFalse();
      expect(component.selectedArticleId).toBeNull();
    });

    it('should load articles on ngOnInit', () => {
      component.ngOnInit();
      expect(articleServiceSpy.getAll).toHaveBeenCalled();
    });
  });

  describe('loadArticles', () => {
    beforeEach(() => {
      // Reset et reconfiguration avant chaque test
      articleServiceSpy.getAll.and.returnValue(of([...mockArticles]));
      articleServiceSpy.getUserReaction.and.returnValue(of({ reactionType: null, badge: null, badgeColor: null }));
    });

    it('should set loading to true while loading', () => {
      component.loadArticles();
      expect(component.loading).toBeTrue();
    });

    it('should load articles successfully', () => {
      component.loadArticles();
      
      expect(component.articles.length).toBe(2);
      expect(component.articles[0].title).toBe('Article Test 1');
      expect(component.articles[0].likeCount).toBe(10);
      expect(component.articles[0].netScore).toBe(8);
    });

    it('should handle default values for missing counts', () => {
      const articlesWithoutCounts = [
        { id: 3, title: 'No Counts', content: 'Content', author: 'Author', category: 'Cat' }
      ];
      articleServiceSpy.getAll.and.returnValue(of(articlesWithoutCounts as Article[]));
      
      component.loadArticles();
      
      expect(component.articles[0].likeCount).toBe(0);
      expect(component.articles[0].dislikeCount).toBe(0);
      expect(component.articles[0].netScore).toBe(0);
    });

    it('should handle error when loading articles', () => {
      const consoleSpy = spyOn(console, 'error');
      articleServiceSpy.getAll.and.returnValue(throwError(() => new Error('Network error')));
      
      component.loadArticles();
      
      expect(component.articles).toEqual([]);
      expect(component.loading).toBeFalse();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('loadUserReactions', () => {
    beforeEach(() => {
      component.articles = JSON.parse(JSON.stringify(mockArticles));
      articleServiceSpy.getUserReaction.and.returnValue(of({ reactionType: 'LIKE', badge: '🔥 POPULAR', badgeColor: '#e67e22' }));
    });

    it('should load user reactions for each article', () => {
      component.loadUserReactions();
      
      expect(articleServiceSpy.getUserReaction).toHaveBeenCalledTimes(2);
      expect(component.articles[0].currentUserReaction).toBe('LIKE');
      expect(component.articles[0].badge).toBe('🔥 POPULAR');
    });

    it('should handle errors when loading user reactions', () => {
      const consoleSpy = spyOn(console, 'error');
      articleServiceSpy.getUserReaction.and.returnValue(throwError(() => new Error('Error')));
      
      component.loadUserReactions();
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('onLike', () => {
    let article: Article;

    beforeEach(() => {
      article = JSON.parse(JSON.stringify(mockArticles[0]));
      articleServiceSpy.toggleReaction.and.returnValue(of(mockReactionResponse));
    });

    it('should not like if loading is true', () => {
      component.loading = true;
      component.onLike(article);
      expect(articleServiceSpy.toggleReaction).not.toHaveBeenCalled();
    });

    it('should not like if animation is in progress', () => {
      component.animatingArticleId = 1;
      component.onLike(article);
      expect(articleServiceSpy.toggleReaction).not.toHaveBeenCalled();
    });

    it('should set animation properties when liking', () => {
      component.onLike(article);
      expect(component.animatingArticleId).toBe(1);
      expect(component.animatingType).toBe('LIKE');
    });

    it('should update article counts after successful like', () => {
      component.onLike(article);
      expect(article.likeCount).toBe(11);
      expect(article.currentUserReaction).toBe('LIKE');
    });

    it('should reset animation after 300ms', fakeAsync(() => {
      component.onLike(article);
      expect(component.animatingArticleId).toBe(1);
      tick(300);
      expect(component.animatingArticleId).toBeNull();
      expect(component.animatingType).toBeNull();
    }));

    it('should handle error when like fails', () => {
      const consoleSpy = spyOn(console, 'error');
      articleServiceSpy.toggleReaction.and.returnValue(throwError(() => new Error('Error')));
      
      component.onLike(article);
      
      expect(component.animatingArticleId).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('onDislike', () => {
    let article: Article;

    beforeEach(() => {
      article = JSON.parse(JSON.stringify(mockArticles[0]));
      const dislikeResponse = { ...mockReactionResponse, currentUserReaction: 'DISLIKE', likeCount: 10, dislikeCount: 3 };
      articleServiceSpy.toggleReaction.and.returnValue(of(dislikeResponse));
    });

    it('should not dislike if loading is true', () => {
      component.loading = true;
      component.onDislike(article);
      expect(articleServiceSpy.toggleReaction).not.toHaveBeenCalled();
    });

    it('should set animation properties when disliking', () => {
      component.onDislike(article);
      expect(component.animatingArticleId).toBe(1);
      expect(component.animatingType).toBe('DISLIKE');
    });

    it('should update article counts after successful dislike', () => {
      component.onDislike(article);
      expect(article.currentUserReaction).toBe('DISLIKE');
    });
  });

  describe('deleteArticle', () => {
    beforeEach(() => {
      articleServiceSpy.getAll.and.returnValue(of([...mockArticles]));
      articleServiceSpy.getUserReaction.and.returnValue(of({ reactionType: null }));
    });

    it('should not delete if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.deleteArticle(1);
      expect(articleServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should delete article when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.deleteArticle(1);
      expect(articleServiceSpy.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Report Modal', () => {
    it('should open report modal with article id', () => {
      component.openReportModal(1);
      expect(component.showReportModal).toBeTrue();
      expect(component.selectedArticleId).toBe(1);
    });

    it('should close report modal and reset values', () => {
      component.openReportModal(1);
      component.closeReportModal();
      expect(component.showReportModal).toBeFalse();
      expect(component.selectedArticleId).toBeNull();
    });
  });

  describe('reportArticle', () => {
    beforeEach(() => {
      component.selectedArticleId = 1;
      component.selectedReason = 'Spam';
      articleServiceSpy.reportArticle.and.returnValue(of({ message: 'Reported successfully' }));
      spyOn(window, 'alert');
    });

    it('should show alert if no reason selected', () => {
      component.selectedReason = '';
      component.reportArticle();
      expect(window.alert).toHaveBeenCalledWith('Veuillez sélectionner une raison');
      expect(articleServiceSpy.reportArticle).not.toHaveBeenCalled();
    });

    it('should report article with selected reason', () => {
      component.reportArticle();
      expect(articleServiceSpy.reportArticle).toHaveBeenCalledWith(1, 'Spam');
    });

    it('should append comment when reason is "Autre"', () => {
      component.selectedReason = 'Autre';
      component.reportComment = 'Commentaire personnalisé';
      component.reportArticle();
      expect(articleServiceSpy.reportArticle).toHaveBeenCalledWith(1, 'Autre: Commentaire personnalisé');
    });

    it('should show success message and close modal', () => {
      component.reportArticle();
      expect(window.alert).toHaveBeenCalledWith('Reported successfully');
      expect(component.showReportModal).toBeFalse();
    });
  });

  describe('getFilteredArticles', () => {
    beforeEach(() => {
      component.articles = JSON.parse(JSON.stringify(mockArticles));
    });

    it('should return all articles when search term is empty', () => {
      component.searchTerm = '';
      const filtered = component.getFilteredArticles();
      expect(filtered.length).toBe(2);
    });

    it('should filter articles by title', () => {
      component.searchTerm = 'Article Test 1';
      const filtered = component.getFilteredArticles();
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Article Test 1');
    });

    it('should filter articles by author', () => {
      component.searchTerm = 'Author 2';
      const filtered = component.getFilteredArticles();
      expect(filtered.length).toBe(1);
      expect(filtered[0].author).toBe('Author 2');
    });

    it('should filter articles by category', () => {
      component.searchTerm = 'Science';
      const filtered = component.getFilteredArticles();
      expect(filtered.length).toBe(1);
      expect(filtered[0].category).toBe('Science');
    });

    it('should be case insensitive', () => {
      component.searchTerm = 'ARTICLE';
      const filtered = component.getFilteredArticles();
      expect(filtered.length).toBe(2);
    });
  });

  describe('getLikePercentage', () => {
    it('should return 0 when total reactions is 0', () => {
      const article: Article = { ...mockArticles[0], likeCount: 0, dislikeCount: 0 };
      const percentage = component.getLikePercentage(article);
      expect(percentage).toBe(0);
    });

    it('should calculate correct percentage', () => {
      const article: Article = { ...mockArticles[0], likeCount: 10, dislikeCount: 5 };
      const percentage = component.getLikePercentage(article);
      expect(percentage).toBe(66.66666666666666);
    });
  });

  describe('getNetScore', () => {
    it('should calculate net score correctly', () => {
      const article: Article = { ...mockArticles[0], likeCount: 15, dislikeCount: 3 };
      const score = component.getNetScore(article);
      expect(score).toBe(12);
    });
  });

  describe('getScoreColor', () => {
    it('should return green for score > 10', () => {
      const article: Article = { ...mockArticles[0], likeCount: 20, dislikeCount: 5 };
      const color = component.getScoreColor(article);
      expect(color).toBe('#27ae60');
    });

    it('should return light green for score between 0 and 10', () => {
      const article: Article = { ...mockArticles[0], likeCount: 8, dislikeCount: 3 };
      const color = component.getScoreColor(article);
      expect(color).toBe('#229954');
    });

    it('should return red for negative score', () => {
      const article: Article = { ...mockArticles[0], likeCount: 3, dislikeCount: 8 };
      const color = component.getScoreColor(article);
      expect(color).toBe('#e74c3c');
    });

    it('should return grey for zero score', () => {
      const article: Article = { ...mockArticles[0], likeCount: 5, dislikeCount: 5 };
      const color = component.getScoreColor(article);
      expect(color).toBe('#7f8c8d');
    });
  });

  describe('User Reaction Status', () => {
    it('should return true if user liked', () => {
      const article: Article = { ...mockArticles[0], currentUserReaction: 'LIKE' };
      expect(component.isLiked(article)).toBeTrue();
    });

    it('should return false if user did not like', () => {
      const article: Article = { ...mockArticles[0], currentUserReaction: 'DISLIKE' };
      expect(component.isLiked(article)).toBeFalse();
    });

    it('should return true if user disliked', () => {
      const article: Article = { ...mockArticles[0], currentUserReaction: 'DISLIKE' };
      expect(component.isDisliked(article)).toBeTrue();
    });
  });

  describe('isAnimating', () => {
    it('should return true when article is animating with matching type', () => {
      component.animatingArticleId = 1;
      component.animatingType = 'LIKE';
      const article: Article = { ...mockArticles[0], id: 1 };
      expect(component.isAnimating(article, 'LIKE')).toBeTrue();
    });

    it('should return false when article id does not match', () => {
      component.animatingArticleId = 2;
      component.animatingType = 'LIKE';
      const article: Article = { ...mockArticles[0], id: 1 };
      expect(component.isAnimating(article, 'LIKE')).toBeFalse();
    });
  });
});