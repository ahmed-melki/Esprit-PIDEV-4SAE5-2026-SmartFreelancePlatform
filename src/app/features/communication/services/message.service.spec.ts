import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessageService } from './message.service';
import { Message } from '../models/message.model';

describe('MessageService', () => {
  let service: MessageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MessageService]
    });
    service = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch messages by conversation', () => {
    const mockMessages = [
      { id: 1, conversationId: 1, senderId: 1, receiverId: 2, content: 'Hello', status: 'SENT', deleted: false, urgent: false }
    ];

    service.getByConversation(1).subscribe(messages => {
      expect(messages.length).toBe(1);
      expect(messages[0].content).toBe('Hello');
    });

    const req = httpMock.expectOne('/api/communication/messages/conversation/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockMessages);
  });

  it('should send a message', () => {
    const newMessage = { conversationId: 1, senderId: 1, receiverId: 2, content: 'Test message', status: 'SENT' } as Message;
    const mockResponse = { id: 99, ...newMessage };

    service.send(newMessage).subscribe(msg => {
      expect(msg.id).toBe(99);
      expect(msg.content).toBe('Test message');
    });

    const req = httpMock.expectOne('/api/communication/messages');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should delete a message', () => {
    service.delete(1).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne('/api/communication/messages/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
