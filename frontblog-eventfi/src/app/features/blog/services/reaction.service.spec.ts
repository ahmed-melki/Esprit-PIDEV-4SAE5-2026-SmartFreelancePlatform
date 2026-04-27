import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactionService } from './reaction.service';
import { ReactionType } from '../models/blog.model';

describe('ReactionService', () => {
  let service: ReactionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReactionService]
    });
    service = TestBed.inject(ReactionService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage for tests
    localStorage.removeItem('blog_session_id');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate and store a session id', () => {
    const sessionId = (service as any).getOrCreateSessionId();
    expect(sessionId).toBeTruthy();
    expect(localStorage.getItem('blog_session_id')).toBe(sessionId);
  });

  it('should toggle a reaction', () => {
    const articleId = 123;
    const type: ReactionType = 'LIKE';
    
    service.toggleReaction(articleId, type).subscribe(res => {
      expect(res.action).toBe('added');
    });

    const req = httpMock.expectOne('http://localhost:8073/api/reactions/toggle');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.articleId).toBe(articleId);
    expect(req.request.body.reactionType).toBe(type);
    
    req.flush({ action: 'added', likeCount: 1, dislikeCount: 0 });
  });

  it('should get user reaction status', () => {
    const articleId = 123;
    
    service.getUserReaction(articleId).subscribe(status => {
      expect(status.hasReacted).toBeTrue();
      expect(status.reactionType).toBe('LIKE');
    });

    const req = httpMock.expectOne(request => 
      request.url === 'http://localhost:8073/api/reactions/user' && 
      request.params.get('articleId') === articleId.toString()
    );
    expect(req.request.method).toBe('GET');
    
    req.flush({ hasReacted: true, reactionType: 'LIKE', likeCount: 1 });
  });
});
