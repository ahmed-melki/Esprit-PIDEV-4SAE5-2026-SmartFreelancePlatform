import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleAddComponent } from './article-add.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ArticleService } from '../service/article.service';
import { of, throwError } from 'rxjs';
import { Article } from '../models/article.model';


describe('ArticleAddComponent', () => {
  let component: ArticleAddComponent;
  let fixture: ComponentFixture<ArticleAddComponent>;
  let articleService: ArticleService;

  const mockArticle: Article = {
    badge: '',
    badgeColor: '',
    netScore: 0,
    dislikeCount: 0,
    id: 1,
    title: 'Test Article',
    content: 'Test Content',
    author: 'Test Author',
    category: 'Test Category',
    createdAt: new Date(),
    updatedAt: new Date(),
    likeCount: 0,
    currentUserReaction: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleAddComponent, HttpClientTestingModule, RouterTestingModule.withRoutes([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleAddComponent);
    component = fixture.componentInstance;
    articleService = TestBed.inject(ArticleService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form as invalid if required fields are empty', () => {
    component.articleForm.controls['title'].setValue('');
    component.articleForm.controls['content'].setValue('');
    expect(component.articleForm.valid).toBeFalse();
  });

  it('should call ArticleService.create and navigate on success', () => {
    spyOn(articleService, 'create').and.returnValue(of(mockArticle));
    const navigateSpy = spyOn((component as any).router, 'navigate');

    component.articleForm.controls['title'].setValue('Test Article');
    component.articleForm.controls['content'].setValue('a'.repeat(200));
    component.articleForm.controls['author'].setValue('Author');
    component.articleForm.controls['category'].setValue('Cat');

    component.onSubmit();

    expect(articleService.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should set errorMessage and stop loading on service error', () => {
    spyOn(articleService, 'create').and.returnValue(throwError(() => new Error('Service Error')));
    component.articleForm.controls['title'].setValue('Test Article');
    component.articleForm.controls['content'].setValue('a'.repeat(200));
    component.articleForm.controls['author'].setValue('Author');
    component.articleForm.controls['category'].setValue('Cat');

    component.onSubmit();

    expect(component.errorMessage).toContain('Erreur');
    expect(component.loading).toBeFalse();
  });
});