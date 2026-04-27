import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleDetailComponent } from './article-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlogService } from '../services/blog.service';
import { ReactionService } from '../services/reaction.service';
import { of } from 'rxjs';
import { Article } from '../models/blog.model';
import { ActivatedRoute } from '@angular/router';

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let blogService: BlogService;

  const mockArticle: Article = {
    id: 1,
    title: 'Test Article',
    content: 'Full Content',
    summary: 'Brief Summary',
    author: 'Reporter',
    category: 'News',
    reportCount: 0,
    likeCount: 5,
    dislikeCount: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleDetailComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: BlogService,
          useValue: {
            getById: () => of(mockArticle),
            getAll: () => of([mockArticle]),
            report: () => of({ success: true })
          }
        },
        {
          provide: ReactionService,
          useValue: {
            getUserReaction: () => of({ reactionType: 'LIKE' }),
            toggleReaction: () => of({ likeCount: 6, dislikeCount: 1, currentUserReaction: 'LIKE' })
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            snapshot: { paramMap: { get: () => '1' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDetailComponent);
    component = fixture.componentInstance;
    blogService = TestBed.inject(BlogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load article details on init', () => {
    expect(component.article).toEqual(mockArticle);
    expect(component.isLoading).toBeFalse();
  });

  it('should handle reaction click', () => {
    const reactionService = TestBed.inject(ReactionService);
    spyOn(reactionService, 'toggleReaction').and.callThrough();
    
    component.onReaction('LIKE');
    
    expect(reactionService.toggleReaction).toHaveBeenCalledWith(1, 'LIKE');
    expect(component.article?.likeCount).toBe(6);
  });

  it('should open and close report modal', () => {
    component.openReportModal();
    expect(component.showReportModal).toBeTrue();
    
    component.closeReportModal();
    expect(component.showReportModal).toBeFalse();
  });
});
