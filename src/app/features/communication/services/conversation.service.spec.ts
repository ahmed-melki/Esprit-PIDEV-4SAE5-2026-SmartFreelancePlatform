import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConversationService } from './conversation.service';

describe('ConversationService', () => {
  let service: ConversationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConversationService]
    });
    service = TestBed.inject(ConversationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all conversations', () => {
    const mockConversations = [
      { id: 1, clientId: 1, freelanceId: 2, projectId: 1, status: 'ACTIVE', urgentCount: 0 }
    ];

    service.getAll().subscribe(conversations => {
      expect(conversations.length).toBe(1);
      expect(conversations[0].clientId).toBe(1);
      expect(conversations[0].status).toBe('ACTIVE');
    });

    const req = httpMock.expectOne('/api/communication/conversations');
    expect(req.request.method).toBe('GET');
    req.flush(mockConversations);
  });

  it('should fetch conversation by id', () => {
    const mockConversation = { id: 1, clientId: 1, freelanceId: 2, projectId: 1, status: 'ACTIVE', urgentCount: 0 };

    service.getById(1).subscribe(conversation => {
      expect(conversation.id).toBe(1);
      expect(conversation.freelanceId).toBe(2);
    });

    const req = httpMock.expectOne('/api/communication/conversations/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockConversation);
  });

  it('should update conversation theme', () => {
    const mockUpdated = { id: 1, clientId: 1, freelanceId: 2, projectId: 1, status: 'ACTIVE', theme: 'dark', urgentCount: 0 };

    service.updateTheme(1, 'dark').subscribe(conversation => {
      expect(conversation.theme).toBe('dark');
    });

    const req = httpMock.expectOne(r => r.url === '/api/communication/conversations/1/theme');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockUpdated);
  });
});
