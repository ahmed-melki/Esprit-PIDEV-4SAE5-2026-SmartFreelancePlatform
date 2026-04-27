import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticleAddComponent } from './article-add.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BlogService } from '../services/blog.service';
import { of, throwError } from 'rxjs';
import { Article } from '../models/blog.model';

describe('ArticleAddComponent', () => {
  let component: ArticleAddComponent;
  let fixture: ComponentFixture<ArticleAddComponent>;
  let blogService: BlogService;

  const mockArticle: Article = {
    id: 1,
    title: 'Test Article',
    content: 'Test Content',
    author: 'Test Author',
    category: 'Test Category',
    reportCount: 0,
    likeCount: 0,
    dislikeCount: 0
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleAddComponent, HttpClientTestingModule, RouterTestingModule.withRoutes([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleAddComponent);
    component = fixture.componentInstance;
    blogService = TestBed.inject(BlogService);
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

  it('should call BlogService.create and navigate on success', () => {
    spyOn(blogService, 'create').and.returnValue(of(mockArticle));
    const navigateSpy = spyOn((component as any).router, 'navigate');

    component.articleForm.controls['title'].setValue('Test Article');
    component.articleForm.controls['content'].setValue('a'.repeat(200));
    component.articleForm.controls['author'].setValue('Author');
    component.articleForm.controls['category'].setValue('Cat');

    component.onSubmit();

    expect(blogService.create).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should set errorMessage and stop loading on service error', () => {
    spyOn(blogService, 'create').and.returnValue(throwError(() => new Error('Service Error')));
    component.articleForm.controls['title'].setValue('Test Article');
    component.articleForm.controls['content'].setValue('a'.repeat(200));
    component.articleForm.controls['author'].setValue('Author');
    component.articleForm.controls['category'].setValue('Cat');

    component.onSubmit();

    expect(component.errorMessage).toContain('Erreur');
    expect(component.loading).toBeFalse();
  });
});