import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { ChatComponent } from './chat.component';
import { MessageService } from '../../services/message.service';
import { ConversationService } from '../../services/conversation.service';
import { ChatService } from '../../services/chat.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PresenceService } from '@core';

describe('ChatComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: 1 }) },
        },
        {
          provide: Router,
          useValue: { navigate: () => Promise.resolve(true) },
        },
        {
          provide: MessageService,
          useValue: {
            getByConversation: () => of([]),
            getSentimentStats: () => of({ positive: 0, neutral: 0, negative: 0 }),
            markAsRead: () => of(void 0),
          },
        },
        {
          provide: ConversationService,
          useValue: {
            getById: () =>
              of({
                id: 1,
                clientId: 1,
                freelanceId: 2,
                theme: 'default',
                otherParticipantName: 'User 2',
              }),
          },
        },
        {
          provide: PresenceService,
          useValue: {
            getPresence: () => of({ online: false, lastSeen: '' }),
          },
        },
        {
          provide: MatSnackBar,
          useValue: { open: () => {} },
        },
        {
          provide: ChatService,
          useValue: {
            sendMessage: () => of(''),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
