import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReportComponent } from './report.component';
import { ArticleService } from '../service/article.service';
import { ReportService } from '../service/report.service';
import { Article } from '../models/article.model';
import { ArticleReport } from '../models/articleReport.model';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;
  let articleServiceSpy: jasmine.SpyObj<ArticleService>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockArticle: Article = {
    id: 1,
    title: 'Article à signaler',
    content: 'Contenu de l\'article à signaler',
    author: 'Auteur Test',
    category: 'Test',
    likeCount: 0,
    dislikeCount: 0,
    badge: null,
    badgeColor: null,
    netScore: 0,
    currentUserReaction: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockReportResponse = {
    message: 'Signalement envoyé avec succès',
    reportId: 123
  };

  beforeEach(async () => {
    articleServiceSpy = jasmine.createSpyObj('ArticleService', ['getById']);
    reportServiceSpy = jasmine.createSpyObj('ReportService', ['reportArticle']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteSpy = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, RouterModule, ReportComponent],
      providers: [
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    
    articleServiceSpy.getById.and.returnValue(of(mockArticle));
    reportServiceSpy.reportArticle.and.returnValue(of(mockReportResponse));
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.articleId).toBeNull();
      expect(component.article).toBeNull();
      expect(component.isSubmitting).toBeFalse();
      expect(component.isLoaded).toBeFalse();
      expect(component.reportData.reason).toBe('');
      expect(component.reportData.description).toBe('');
      expect(component.reportData.reporterName).toBe('');
      expect(component.reportData.email).toBe('');
    });

    it('should have predefined reasons list', () => {
      expect(component.reasons.length).toBe(7);
      expect(component.reasons[0].value).toBe('inappropriate');
      expect(component.reasons[1].value).toBe('spam');
      expect(component.reasons[2].value).toBe('harassment');
      expect(component.reasons[3].value).toBe('hate-speech');
      expect(component.reasons[4].value).toBe('violence');
      expect(component.reasons[5].value).toBe('copyright');
      expect(component.reasons[6].value).toBe('other');
    });
  });

  describe('ngOnInit', () => {
    it('should get articleId from route params', () => {
      component.ngOnInit();
      expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(component.articleId).toBe(1);
    });

    it('should load article when articleId exists', () => {
      component.ngOnInit();
      expect(articleServiceSpy.getById).toHaveBeenCalledWith(1);
    });

    it('should not load article when articleId is null', () => {
      activatedRouteSpy.snapshot.paramMap.get.and.returnValue(null);
      const newFixture = TestBed.createComponent(ReportComponent);
      const newComponent = newFixture.componentInstance;
      
      expect(articleServiceSpy.getById).not.toHaveBeenCalled();
    });
  });

  describe('loadArticle', () => {
    beforeEach(() => {
      component.articleId = 1;
    });

    it('should load article successfully', fakeAsync(() => {
      component.loadArticle();
      tick();
      
      expect(component.article).toEqual(mockArticle);
      expect(component.isLoaded).toBeTrue();
    }));

    it('should handle error when article not found', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      const alertSpy = spyOn(window, 'alert');
      articleServiceSpy.getById.and.returnValue(throwError(() => new Error('Not found')));
      
      component.loadArticle();
      tick();
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith('Article non trouvé');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));
  });

  describe('submitReport', () => {
    beforeEach(() => {
      component.articleId = 1;
      component.article = mockArticle;
      component.reportData = {
        reason: 'spam',
        description: 'Ceci est une description détaillée du signalement',
        reporterName: 'Test User',
        email: 'test@example.com'
      };
    });

    it('should show alert if no reason selected', () => {
      const alertSpy = spyOn(window, 'alert');
      component.reportData.reason = '';
      
      component.submitReport();
      
      expect(alertSpy).toHaveBeenCalledWith('Veuillez sélectionner un motif');
      expect(reportServiceSpy.reportArticle).not.toHaveBeenCalled();
    });

    it('should show alert if description is empty', () => {
      const alertSpy = spyOn(window, 'alert');
      component.reportData.description = '';
      
      component.submitReport();
      
      expect(alertSpy).toHaveBeenCalledWith('Veuillez fournir une description détaillée');
      expect(reportServiceSpy.reportArticle).not.toHaveBeenCalled();
    });

    it('should show alert if description is only whitespace', () => {
      const alertSpy = spyOn(window, 'alert');
      component.reportData.description = '   ';
      
      component.submitReport();
      
      expect(alertSpy).toHaveBeenCalledWith('Veuillez fournir une description détaillée');
      expect(reportServiceSpy.reportArticle).not.toHaveBeenCalled();
    });

    it('should set isSubmitting to true during submission', fakeAsync(() => {
      component.submitReport();
      expect(component.isSubmitting).toBeTrue();
      tick();
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should submit report successfully', fakeAsync(() => {
      const alertSpy = spyOn(window, 'alert');
      
      component.submitReport();
      tick();
      
      expect(reportServiceSpy.reportArticle).toHaveBeenCalledWith(1, {
        reason: 'spam',
        description: 'Ceci est une description détaillée du signalement',
        reporterName: 'Test User',
        email: 'test@example.com'
      });
      expect(alertSpy).toHaveBeenCalledWith('Signalement envoyé avec succès');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['articles']);
    }));

    it('should set reporterName to "Anonyme" when empty', fakeAsync(() => {
      component.reportData.reporterName = '';
      component.reportData.email = '';
      
      component.submitReport();
      tick();
      
      expect(reportServiceSpy.reportArticle).toHaveBeenCalledWith(1, jasmine.objectContaining({
        reporterName: 'Anonyme'
      }));
    }));

    it('should handle server error (status 0)', fakeAsync(() => {
      const alertSpy = spyOn(window, 'alert');
      const errorResponse = { status: 0, error: {} };
      reportServiceSpy.reportArticle.and.returnValue(throwError(() => errorResponse));
      
      component.submitReport();
      tick();
      
      expect(alertSpy).toHaveBeenCalledWith('Erreur lors du signalement. Impossible de contacter le serveur.');
      expect(component.isSubmitting).toBeFalse();
    }));

    it('should handle 404 error', fakeAsync(() => {
      const alertSpy = spyOn(window, 'alert');
      const errorResponse = { status: 404, error: {} };
      reportServiceSpy.reportArticle.and.returnValue(throwError(() => errorResponse));
      
      component.submitReport();
      tick();
      
      expect(alertSpy).toHaveBeenCalledWith('Erreur lors du signalement. Article non trouvé.');
    }));

    it('should handle error with custom message', fakeAsync(() => {
      const alertSpy = spyOn(window, 'alert');
      const errorResponse = { status: 500, error: { error: 'Erreur serveur personnalisée' } };
      reportServiceSpy.reportArticle.and.returnValue(throwError(() => errorResponse));
      
      component.submitReport();
      tick();
      
      expect(alertSpy).toHaveBeenCalledWith('Erreur lors du signalement. Erreur serveur personnalisée');
    }));

    it('should handle generic error', fakeAsync(() => {
      const alertSpy = spyOn(window, 'alert');
      const errorResponse = { status: 500, error: {} };
      reportServiceSpy.reportArticle.and.returnValue(throwError(() => errorResponse));
      
      component.submitReport();
      tick();
      
      expect(alertSpy).toHaveBeenCalledWith('Erreur lors du signalement. Veuillez réessayer.');
    }));
  });

  describe('cancelReport', () => {
    it('should navigate to articles page', () => {
      component.cancelReport();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/articles']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle report with minimum required fields', fakeAsync(() => {
      const alertSpy = spyOn(window, 'alert');
      component.articleId = 1;
      component.reportData = {
        reason: 'other',
        description: 'Minimum description',
        reporterName: '',
        email: ''
      };
      
      component.submitReport();
      tick();
      
      expect(reportServiceSpy.reportArticle).toHaveBeenCalledWith(1, {
        reason: 'other',
        description: 'Minimum description',
        reporterName: 'Anonyme',
        email: ''
      });
    }));

    it('should handle report with email only', fakeAsync(() => {
      component.articleId = 1;
      component.reportData = {
        reason: 'copyright',
        description: 'Description avec email',
        reporterName: '',
        email: 'user@example.com'
      };
      
      component.submitReport();
      tick();
      
      expect(reportServiceSpy.reportArticle).toHaveBeenCalledWith(1, jasmine.objectContaining({
        email: 'user@example.com',
        reporterName: 'Anonyme'
      }));
    }));

    it('should preserve reporterName when provided', fakeAsync(() => {
      component.articleId = 1;
      component.reportData = {
        reason: 'harassment',
        description: 'Description',
        reporterName: 'John Doe',
        email: ''
      };
      
      component.submitReport();
      tick();
      
      expect(reportServiceSpy.reportArticle).toHaveBeenCalledWith(1, jasmine.objectContaining({
        reporterName: 'John Doe'
      }));
    }));

    it('should handle long description text', fakeAsync(() => {
      const longDescription = 'A'.repeat(1000);
      component.articleId = 1;
      component.reportData = {
        reason: 'violence',
        description: longDescription,
        reporterName: 'Test',
        email: 'test@test.com'
      };
      
      component.submitReport();
      tick();
      
      expect(reportServiceSpy.reportArticle).toHaveBeenCalledWith(1, jasmine.objectContaining({
        description: longDescription
      }));
    }));
  });

  describe('Multiple Submissions', () => {
    beforeEach(() => {
      component.articleId = 1;
      component.reportData = {
        reason: 'spam',
        description: 'Test description',
        reporterName: 'Test',
        email: 'test@test.com'
      };
    });

    it('should prevent multiple submissions while submitting', fakeAsync(() => {
      component.submitReport();
      component.submitReport(); // Second submission
      tick();
      
      // Should only be called once
      expect(reportServiceSpy.reportArticle).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Article Loading States', () => {
    it('should display loading state while fetching article', fakeAsync(() => {
      component.articleId = 1;
      component.loadArticle();
      
      expect(component.isLoaded).toBeFalse();
      tick();
      expect(component.isLoaded).toBeTrue();
    }));

    it('should set article to null when not found', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      articleServiceSpy.getById.and.returnValue(throwError(() => new Error('Not found')));
      
      component.loadArticle();
      tick();
      
      expect(component.article).toBeNull();
    }));
  });

  describe('Form Validation Edge Cases', () => {
    beforeEach(() => {
      component.articleId = 1;
    });

    it('should reject submission with empty description after trim', () => {
      const alertSpy = spyOn(window, 'alert');
      component.reportData = {
        reason: 'spam',
        description: '\n\n   \n\n',
        reporterName: 'Test',
        email: 'test@test.com'
      };
      
      component.submitReport();
      
      expect(alertSpy).toHaveBeenCalledWith('Veuillez fournir une description détaillée');
    });

    it('should accept description with valid content even if it has leading/trailing spaces', fakeAsync(() => {
      const alertSpy = spyOn(window, 'alert');
      component.reportData = {
        reason: 'spam',
        description: '  Valid description with spaces  ',
        reporterName: 'Test',
        email: 'test@test.com'
      };
      
      component.submitReport();
      tick();
      
      expect(alertSpy).not.toHaveBeenCalledWith('Veuillez fournir une description détaillée');
      expect(reportServiceSpy.reportArticle).toHaveBeenCalled();
    }));
  });
});