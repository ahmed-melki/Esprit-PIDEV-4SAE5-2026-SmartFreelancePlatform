import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleListComponent } from './article-list.component';
import { ArticleService } from '../service/article.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('ArticleListComponent', () => {
  let component: ArticleListComponent;
  let fixture: ComponentFixture<ArticleListComponent>;
  let mockService: any;
  let mockReportService: any;

  const mockArticles = [
    { id: 1, title: 'Article 1', selectedReason: '', comment: '' },
    { id: 2, title: 'Article 2', selectedReason: '', comment: '' },
  ];

  beforeEach(async () => {
    mockService = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of(mockArticles)),
      delete: jasmine.createSpy('delete').and.returnValue(of({})),
    };

    mockReportService = {
      reportArticle: jasmine.createSpy('reportArticle').and.returnValue(of('Signalement réussi')),
    };

    await TestBed.configureTestingModule({
      imports: [ArticleListComponent],
      providers: [
        { provide: ArticleService, useValue: mockService },
        { provide: ActivatedRoute, useValue: { params: of({}), snapshot: { paramMap: { get: () => null } } } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent);
    component = fixture.componentInstance;

    // inject reportService manuellement car ce n'est pas un provider Angular
    component.reportService = mockReportService;

    // Mock window.confirm et window.alert pour éviter les popups
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load articles on init', () => {
    component.ngOnInit();
    expect(mockService.getAll).toHaveBeenCalled();
    expect(component.articles.length).toBe(2);
  });

  it('should delete an article when confirmed', () => {
    component.deleteArticle(1);
    expect(mockService.delete).toHaveBeenCalledWith(1);
    expect(mockService.getAll).toHaveBeenCalledTimes(2); // une fois au loadArticles, une fois après delete
  });

  it('should not delete an article when cancelled', () => {
    (window.confirm as jasmine.Spy).and.returnValue(false);
    component.deleteArticle(1);
    expect(mockService.delete).not.toHaveBeenCalled();
  });

  it('should report an article with reason', () => {
    const article = component.articles[0];
    article.selectedReason = 'Spam';
    component.report(article.id);
    expect(mockReportService.reportArticle).toHaveBeenCalledWith(article.id, 'Spam');
    expect(article.selectedReason).toBe('');
  });

  it('should report an article with "Autre" reason and comment', () => {
    const article = component.articles[0];
    article.selectedReason = 'Autre';
    article.comment = 'Contenu inapproprié';
    component.report(article.id);
    expect(mockReportService.reportArticle).toHaveBeenCalledWith(article.id, 'Autre: Contenu inapproprié');
    expect(article.selectedReason).toBe('');
    expect(article.comment).toBe('');
  });

  it('should not report if reason is empty', () => {
    const article = component.articles[0];
    article.selectedReason = '';
    component.report(article.id);
    expect(mockReportService.reportArticle).not.toHaveBeenCalled();
  });

  it('should handle report service error', () => {
    const article = component.articles[0];
    article.selectedReason = 'Spam';
    mockReportService.reportArticle.and.returnValue(throwError(() => new Error('Erreur')));
    component.report(article.id);
    expect(window.alert).toHaveBeenCalledWith('Impossible de signaler l’article');
  });

});