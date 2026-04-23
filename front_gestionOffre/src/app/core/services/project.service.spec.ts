import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProjectService } from './project.service';
import { Project } from '../models/project.model';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8045/api/projects';

  const mockProject: Project = {
    id: 1,
    title: 'Test Project',
    description: 'Test Description',
    budget: 5000,
    deadline: '2026-12-31',
    status: 'OPEN',
    createdAt: '2026-04-20T10:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create a project', () => {
    service.addProject(mockProject).subscribe((project) => {
      expect(project).toEqual(mockProject);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProject);
    req.flush(mockProject);
  });

  it('should return all projects', () => {
    const projects: Project[] = [mockProject, { ...mockProject, id: 2, title: 'Another Project' }];

    service.getProjects().subscribe((response) => {
      expect(response.length).toBe(2);
      expect(response.map((p) => p.id)).toEqual([2, 1]);
      expect(response.map((p) => p.title)).toEqual(['Another Project', 'Test Project']);
    });

    const req = httpMock.expectOne((request) =>
      request.url === apiUrl &&
      request.params.get('page') === '0' &&
      request.params.get('size') === '100' &&
      request.params.get('sort') === 'id,desc'
    );
    expect(req.request.method).toBe('GET');
    req.flush(projects);
  });

  it('should return one project by id', () => {
    service.getProjectById(1).subscribe((project) => {
      expect(project.id).toBe(1);
      expect(project.title).toBe('Test Project');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProject);
  });

  it('should update a project', () => {
    const updatedProject: Project = {
      ...mockProject,
      title: 'Updated Title',
      description: 'Updated Description',
      budget: 8000
    };

    service.updateProject(1, updatedProject).subscribe((project) => {
      expect(project.title).toBe('Updated Title');
      expect(project.description).toBe('Updated Description');
      expect(project.budget).toBe(8000);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProject);
    req.flush(updatedProject);
  });

  it('should partially update a project', () => {
    const partialUpdates: Partial<Project> = {
      title: 'Partially Updated',
      budget: 7500
    };

    const patchedProject: Project = {
      ...mockProject,
      title: 'Partially Updated',
      budget: 7500
    };

    service.updateProjectPartial(1, partialUpdates).subscribe((project) => {
      expect(project.title).toBe('Partially Updated');
      expect(project.budget).toBe(7500);
      expect(project.description).toBe('Test Description');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(partialUpdates);
    req.flush(patchedProject);
  });

  it('should return matching projects for freelancer', () => {
    const matchedProjects: Project[] = [mockProject, { ...mockProject, id: 2, title: 'Match 2' }];

    service.getMatchingProjects(1).subscribe((projects) => {
      expect(projects.length).toBe(2);
      expect(projects).toEqual(matchedProjects);
    });

    const req = httpMock.expectOne(`${apiUrl}/matching/1`);
    expect(req.request.method).toBe('GET');
    req.flush(matchedProjects);
  });

  it('should delete a project', () => {
    service.deleteProject(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
