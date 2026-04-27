import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CreateComponent } from './create-event.component';
import { EventService } from '../event.service';
import { FormsModule } from '@angular/forms';

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;
  let eventService: jasmine.SpyObj<EventService>;
  let router: jasmine.SpyObj<Router>;

  const mockEvent = {
    title: 'Test',
    description: 'Desc',
    category: 'Cat',
    type: 'HACKATHON',
    startDate: '',
    endDate: '',
    location: '',
    price: 0
  };

  beforeEach(async () => {
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['create']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreateComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: EventService, useValue: eventServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ✅ TEST FILE UPLOAD
  it('should set selected file and preview image', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const event = { target: { files: [file] } };

    spyOn(window as any, 'FileReader').and.returnValue({
      readAsDataURL: jasmine.createSpy(),
      onload: null
    });

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(file);
  });

  // ✅ VALIDATOR TEST
  it('should set error when value is empty or spaces', () => {
    const mockModel: any = {
      value: '   ',
      control: {
        errors: {},
        setErrors: jasmine.createSpy()
      }
    };

    component.noOnlySpaces(mockModel);

    expect(mockModel.control.setErrors).toHaveBeenCalledWith({ required: true });
  });

  it('should clear error when value is valid', () => {
    const mockModel: any = {
      value: 'Valid text',
      control: {
        errors: { required: true },
        setErrors: jasmine.createSpy()
      }
    };

    component.noOnlySpaces(mockModel);

    expect(mockModel.control.setErrors).toHaveBeenCalled();
  });

  // ✅ SAVE SUCCESS
  it('should create event successfully', fakeAsync(() => {
    eventService.create.and.returnValue(of(mockEvent));

    component.saveEvent();

    expect(eventService.create).toHaveBeenCalled();
    tick();

    expect(component.successMessage).toContain('créé avec succès');

    tick(5000);
    expect(component.successMessage).toBe('');
  }));

  // ✅ SAVE ERROR
  it('should handle error when saving event', () => {
    spyOn(console, 'error');
    eventService.create.and.returnValue(
      throwError(() => new Error('API error'))
    );

    component.saveEvent();

    expect(console.error).toHaveBeenCalled();
  });
});
