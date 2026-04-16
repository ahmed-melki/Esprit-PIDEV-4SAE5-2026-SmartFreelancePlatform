import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProjectService } from '../../../core/services/project.service';
import { FindProjectComponent } from './find-project.component';

describe('FindProjectComponent', () => {
  let component: FindProjectComponent;
  let fixture: ComponentFixture<FindProjectComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;

  beforeEach(async () => {
    projectService = jasmine.createSpyObj<ProjectService>('ProjectService', ['getProjects']);

    await TestBed.configureTestingModule({
      imports: [FindProjectComponent],
      providers: [{ provide: ProjectService, useValue: projectService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FindProjectComponent);
    component = fixture.componentInstance;
  });

  it('should unwrap project lists returned inside an object', () => {
    projectService.getProjects.and.returnValue(of({
      projects: [
        { title: 'Angular Dashboard', description: 'Frontend project' },
        { title: 'Spring API', description: 'Backend project' },
      ],
    } as any));

    component.fetchProjects();

    expect(component.projects.length).toBe(2);
    expect(component.error).toBeFalse();
    expect(component.isLoading).toBeFalse();
  });

  it('should filter and paginate the loaded projects', () => {
    component.projects = Array.from({ length: 10 }, (_, index) => ({
      title: `Project ${index + 1}`,
      description: index === 8 ? 'Angular migration' : 'Generic mission',
    } as any));
    component.pageSize = 4;
    component.currentPage = 3;
    component.onSearch({ target: { value: 'angular' } });

    expect(component.currentPage).toBe(1);
    expect(component.filteredProjects.length).toBe(1);
    expect(component.paginatedProjects.length).toBe(1);
    expect(component.totalPages).toBe(1);
    expect(component.paginatedProjects[0].title).toBe('Project 9');
  });

  it('should switch to an error state when loading fails', () => {
    projectService.getProjects.and.returnValue(throwError(() => new Error('network')));

    component.fetchProjects();

    expect(component.error).toBeTrue();
    expect(component.isLoading).toBeFalse();
  });
});
