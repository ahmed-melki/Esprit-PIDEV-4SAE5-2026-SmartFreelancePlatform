import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMoodComponent } from './event-mood.component';

describe('EventMoodComponent', () => {
  let component: EventMoodComponent;
  let fixture: ComponentFixture<EventMoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventMoodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventMoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
