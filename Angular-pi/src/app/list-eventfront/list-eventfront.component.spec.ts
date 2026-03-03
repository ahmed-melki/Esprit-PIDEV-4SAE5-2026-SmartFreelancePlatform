import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeventfrontComponent } from './list-eventfront.component';

describe('ListEventfrontComponent', () => {
  let component: ListeventfrontComponent;
  let fixture: ComponentFixture<ListeventfrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeventfrontComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeventfrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
