import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ArticleUpdateComponent } from './article-update.component';
import { ArticleService } from '../service/article.service';
import { Article } from '../models/article.model';

describe('ArticleUpdateComponent', () => {
  let component: ArticleUpdateComponent;
  let fixture: ComponentFixture<ArticleUpdateComponent>;
  let articleServiceSpy: jasmine.SpyObj<ArticleService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  const mockArticle: Article = {
    id: 1,
    title: 'Article Test',
    content: 'This is a test content with more than 20 characters',
    summary: 'Test summary',
    author: 'Test Author',
    category: 'Technology',
    tags: 'angular,test',
    status: 'Brouillon',
    likeCount: 0,
    dislikeCount: 0,
    badge: null,
    badgeColor: null,
    netScore: 0,
    currentUserReaction: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    articleServiceSpy = jasmine.createSpyObj('ArticleService', ['getById', 'update']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteSpy = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, 
        ReactiveFormsModule, 
        RouterModule, 
        ArticleUpdateComponent,
        HttpClientTestingModule // Ajouté pour résoudre l'erreur HttpClient
      ],
      providers: [
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleUpdateComponent);
    component = fixture.componentInstance;
    
    articleServiceSpy.getById.and.returnValue(of(mockArticle));
    articleServiceSpy.update.and.returnValue(of(mockArticle));
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      expect(component.articleForm).toBeDefined();
      expect(component.articleForm.get('title')).toBeDefined();
      expect(component.articleForm.get('content')).toBeDefined();
      expect(component.articleForm.get('author')).toBeDefined();
      expect(component.articleForm.get('category')).toBeDefined();
      expect(component.articleForm.get('status')?.value).toBe('Brouillon');
    });

    it('should have required validators on title', () => {
      const titleControl = component.articleForm.get('title');
      expect(titleControl?.validator).toBeTruthy();
    });

    it('should have required validators on content', () => {
      const contentControl = component.articleForm.get('content');
      expect(contentControl?.validator).toBeTruthy();
    });
  });

  describe('ngOnInit', () => {
    it('should load article when id parameter is present', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(articleServiceSpy.getById).toHaveBeenCalledWith(1);
    }));

    it('should set articleId from route params', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(component.articleId).toBe(1);
    }));

    it('should not load article when id parameter is absent', () => {
      // Recréer le composant avec des params vides
      const emptyParamsRoute = {
        params: of({})
      };
      
      TestBed.overrideProvider(ActivatedRoute, { useValue: emptyParamsRoute });
      const newFixture = TestBed.createComponent(ArticleUpdateComponent);
      const newComponent = newFixture.componentInstance;
      
      // Vérifier que getById n'a pas été appelé
      expect(articleServiceSpy.getById).not.toHaveBeenCalled();
    });
  });

  describe('loadArticle', () => {
    beforeEach(() => {
      component.articleId = 1;
      // Reset loading state
      component.loading = false;
    });

    it('should set loading to true while loading', fakeAsync(() => {
      // Créer un observable qui ne se complète pas immédiatement
      let resolveLoading: any;
      const loadingObservable = new Promise(resolve => {
        resolveLoading = resolve;
      });
      
      // Appel de la méthode
      component.loadArticle();
      
      // Vérifier que loading est true
      expect(component.loading).toBeTrue();
      
      // Compléter l'observable
      tick();
    }));

    it('should load article successfully and patch form values', fakeAsync(() => {
      component.loadArticle();
      tick();
      
      expect(component.articleForm.get('title')?.value).toBe('Article Test');
      expect(component.articleForm.get('content')?.value).toBe('This is a test content with more than 20 characters');
      expect(component.articleForm.get('author')?.value).toBe('Test Author');
      expect(component.articleForm.get('category')?.value).toBe('Technology');
      expect(component.loading).toBeFalse();
    }));

    it('should handle optional fields when they are undefined', fakeAsync(() => {
      const articleWithoutOptional: Article = { 
        ...mockArticle, 
        summary: undefined, 
        tags: undefined 
      };
      articleServiceSpy.getById.and.returnValue(of(articleWithoutOptional));
      
      component.loadArticle();
      tick();
      
      expect(component.articleForm.get('summary')?.value).toBe('');
      expect(component.articleForm.get('tags')?.value).toBe('');
    }));

    it('should handle error when loading article fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      articleServiceSpy.getById.and.returnValue(throwError(() => new Error('Network error')));
      
      component.loadArticle();
      tick();
      
      expect(component.errorMessage).toBe('Impossible de charger l\'article.');
      expect(component.loading).toBeFalse();
      expect(consoleSpy).toHaveBeenCalled();
    }));
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      // Remplir le formulaire avec des données valides
      component.articleForm.patchValue({
        title: 'Valid Title',
        content: 'This is a valid content with more than 20 characters',
        author: 'Valid Author',
        category: 'Valid Category'
      });
    });

    it('should mark form invalid when title is empty', () => {
      component.articleForm.get('title')?.setValue('');
      expect(component.articleForm.invalid).toBeTrue();
    });

    it('should mark form invalid when title is too short', () => {
      component.articleForm.get('title')?.setValue('ab');
      expect(component.articleForm.invalid).toBeTrue();
    });

    it('should mark form invalid when content is empty', () => {
      component.articleForm.get('content')?.setValue('');
      expect(component.articleForm.invalid).toBeTrue();
    });

    it('should mark form invalid when content is too short', () => {
      component.articleForm.get('content')?.setValue('Too short');
      expect(component.articleForm.invalid).toBeTrue();
    });

    it('should mark form invalid when author is empty', () => {
      component.articleForm.get('author')?.setValue('');
      expect(component.articleForm.invalid).toBeTrue();
    });

    it('should mark form invalid when category is empty', () => {
      component.articleForm.get('category')?.setValue('');
      expect(component.articleForm.invalid).toBeTrue();
    });

    it('should mark form valid when all required fields are filled correctly', () => {
      expect(component.articleForm.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    beforeEach(fakeAsync(() => {
      component.articleId = 1;
      component.loadArticle();
      tick();
      // Reset update spy
      articleServiceSpy.update.calls.reset();
    }));

    it('should set submitted to true when onSubmit is called', () => {
      expect(component.submitted).toBeFalse();
      component.onSubmit();
      expect(component.submitted).toBeTrue();
    });

    it('should not submit if form is invalid', () => {
      component.articleForm.get('title')?.setValue('');
      component.onSubmit();
      
      expect(articleServiceSpy.update).not.toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });

    it('should call articleService.update with form data when form is valid', fakeAsync(() => {
      component.onSubmit();
      tick();
      
      expect(articleServiceSpy.update).toHaveBeenCalledWith(1, component.articleForm.value);
    }));

    it('should set loading to true during submission', () => {
      // Ne pas attendre tick pour vérifier loading
      component.onSubmit();
      expect(component.loading).toBeTrue();
    });

    it('should navigate to home page on successful update', fakeAsync(() => {
      component.onSubmit();
      tick();
      
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    }));

    it('should handle error when update fails', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      articleServiceSpy.update.and.returnValue(throwError(() => new Error('Update error')));
      
      component.onSubmit();
      tick();
      
      expect(component.errorMessage).toBe('Erreur lors de la modification.');
      expect(component.loading).toBeFalse();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    }));

    it('should reset errorMessage before new submission', fakeAsync(() => {
      component.errorMessage = 'Previous error';
      component.onSubmit();
      tick();
      
      expect(component.errorMessage).toBe('');
    }));
  });

  describe('onCancel', () => {
    it('should navigate to home page when onCancel is called', () => {
      component.onCancel();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Form Getters', () => {
    it('should return form controls via f getter', () => {
      expect(component.f).toBe(component.articleForm.controls);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      component.articleForm.patchValue({
        title: 'Valid Title',
        content: 'This is a valid content with more than 20 characters',
        author: 'Valid Author',
        category: 'Valid Category'
      });
    });

    it('should handle title with maximum length (200 chars)', () => {
      const longTitle = 'a'.repeat(200);
      component.articleForm.get('title')?.setValue(longTitle);
      
      expect(component.articleForm.get('title')?.valid).toBeTrue();
    });

    it('should mark title invalid when exceeding max length', () => {
      const tooLongTitle = 'a'.repeat(201);
      component.articleForm.get('title')?.setValue(tooLongTitle);
      
      expect(component.articleForm.get('title')?.invalid).toBeTrue();
    });

    it('should handle content with exactly 20 characters', () => {
      const exactContent = 'a'.repeat(20);
      component.articleForm.get('content')?.setValue(exactContent);
      
      expect(component.articleForm.get('content')?.valid).toBeTrue();
    });

    it('should handle status field correctly', () => {
      expect(component.articleForm.get('status')?.value).toBe('Brouillon');
      
      component.articleForm.patchValue({ status: 'Publié' });
      expect(component.articleForm.get('status')?.value).toBe('Publié');
    });
  });

  describe('Multiple Submissions', () => {
    beforeEach(fakeAsync(() => {
      component.articleId = 1;
      component.loadArticle();
      tick();
      articleServiceSpy.update.calls.reset();
      // Make update take some time
      articleServiceSpy.update.and.returnValue(of(mockArticle));
    }));

    it('should allow multiple submissions after first completes', fakeAsync(() => {
      component.onSubmit();
      tick();
      component.onSubmit();
      tick();
      
      expect(articleServiceSpy.update).toHaveBeenCalledTimes(2);
    }));
  });

  describe('User Interaction', () => {
    it('should mark field as touched on user interaction', () => {
      const titleControl = component.articleForm.get('title');
      titleControl?.markAsTouched();
      
      expect(titleControl?.touched).toBeTrue();
    });
  });
});