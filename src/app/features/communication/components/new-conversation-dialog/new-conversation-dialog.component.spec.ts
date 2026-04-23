import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NewConversationDialogComponent } from './new-conversation-dialog.component';

describe('NewConversationDialogComponent', () => {
  let component: NewConversationDialogComponent;
  let fixture: ComponentFixture<NewConversationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewConversationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewConversationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when no selection', () => {
    expect(component.conversationForm.valid).toBe(false);
  });
});
