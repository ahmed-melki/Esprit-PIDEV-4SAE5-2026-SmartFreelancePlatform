import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { PostProjectComponent } from './post-project.component';

describe('PostProjectComponent', () => {
  let component: PostProjectComponent;
  let fixture: ComponentFixture<PostProjectComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let router: Router;

  beforeEach(async () => {
    projectService = jasmine.createSpyObj<ProjectService>('ProjectService', ['addProject']);

    await TestBed.configureTestingModule({
      imports: [PostProjectComponent],
      providers: [
        provideRouter([]),
        { provide: ProjectService, useValue: projectService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostProjectComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('should not submit when the form is invalid', () => {
    component.projectForm.patchValue({
      title: '',
      description: '',
      budget: 0,
      deadline: '',
    });

    component.onSubmit();

    expect(projectService.addProject).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBeFalse();
  });

  it('should append required skills before creating a project', () => {
    projectService.addProject.and.returnValue(of({
      title: 'Plateforme',
      description: 'Description',
      budget: 2000,
      deadline: '2026-12-31',
      client: { id: 1 },
    } as any));

    component.projectForm.patchValue({
      title: 'Plateforme',
      description: 'Projet Angular',
      budget: 2000,
      deadline: '2026-12-31',
      skills: 'Angular, Spring Boot',
    });

    component.onSubmit();

    expect(projectService.addProject).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Plateforme',
      description: 'Projet Angular\n\nRequired Skills: Angular, Spring Boot',
      budget: 2000,
      deadline: '2026-12-31',
      client: { id: 1 },
    }));
    expect(router.navigate).toHaveBeenCalledWith(['/client/dashboard']);
    expect(component.isSubmitting).toBeFalse();
    expect(component.submitError).toBe('');
  });

  it('should expose a submission error when the API fails', () => {
    projectService.addProject.and.returnValue(throwError(() => new Error('backend down')));

    component.projectForm.patchValue({
      title: 'Plateforme',
      description: 'Projet Angular',
      budget: 2000,
      deadline: '2026-12-31',
      skills: '',
    });

    component.onSubmit();

    expect(component.isSubmitting).toBeFalse();
    expect(component.submitError).toContain('Failed to post project');
  });
});
