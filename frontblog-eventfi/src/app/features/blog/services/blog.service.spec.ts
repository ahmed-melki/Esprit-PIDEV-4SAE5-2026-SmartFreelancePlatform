import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BlogService } from './blog.service';
import { Article } from '../models/blog.model';

describe('BlogService', () => {
  let service: BlogService;
  let httpMock: HttpTestingController;

  const mockArticles: Article[] = [
    { id: 1, title: 'Test 1', content: 'Content 1', author: 'A1', category: 'C1', reportCount: 0, likeCount: 5, dislikeCount: 0 },
    { id: 2, title: 'Test 2', content: 'Content 2', author: 'A2', category: 'C2', reportCount: 0, likeCount: 10, dislikeCount: 1 }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BlogService]
    });
    service = TestBed.inject(BlogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all articles (getAll)', () => {
    service.getAll().subscribe(articles => {
      expect(articles.length).toBe(2);
      expect(articles).toEqual(mockArticles);
    });

    const req = httpMock.expectOne('http://localhost:8082/piblog/api/articles');
    expect(req.request.method).toBe('GET');
    req.flush(mockArticles);
  });

  it('should fetch an article by id (getById)', () => {
    service.getById(1).subscribe(article => {
      expect(article).toEqual(mockArticles[0]);
    });

    const req = httpMock.expectOne('http://localhost:8082/piblog/api/articles/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockArticles[0]);
  });

  it('should create a new article (create)', () => {
    const newArticle = mockArticles[0];
    service.create(newArticle).subscribe(article => {
      expect(article).toEqual(newArticle);
    });

    const req = httpMock.expectOne('http://localhost:8082/piblog/api/articles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newArticle);
    req.flush(newArticle);
  });

  it('should update an article (update)', () => {
    const updatedArticle = { ...mockArticles[0], title: 'Updated' };
    service.update(1, updatedArticle).subscribe(article => {
      expect(article.title).toBe('Updated');
    });

    const req = httpMock.expectOne('http://localhost:8082/piblog/api/articles/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedArticle);
  });

  it('should delete an article (delete)', () => {
    service.delete(1).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8082/piblog/api/articles/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should report an article (report)', () => {
    const reportData = { articleId: 1, reason: 'SPAM', description: 'Sample' };
    service.report(1, reportData).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('http://localhost:8082/piblog/api/articles/1/report');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });
});
