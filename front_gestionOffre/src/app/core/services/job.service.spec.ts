import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { JobService } from './job.service';
import { JobOffer } from '../models/job.model';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8052/api/jobs';

  const mockJob: JobOffer = {
    id: 1,
    title: 'Developpeur Java',
    description: 'Poste Spring Boot',
    company: 'TechCorp',
    location: 'Paris',
    contractType: 'CDI',
    salaryMin: 40000,
    salaryMax: 60000,
    status: 'OPEN'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create a job', () => {
    service.create(mockJob).subscribe((job) => {
      expect(job).toEqual(mockJob);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockJob);
    req.flush(mockJob);
  });

  it('should return all jobs', () => {
    const jobs = [mockJob, { ...mockJob, id: 2, title: 'Data Scientist' }];

    service.getAll().subscribe((response) => {
      expect(response.length).toBe(2);
      expect(response).toEqual(jobs);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(jobs);
  });

  it('should return one job by id', () => {
    service.getById(1).subscribe((job) => {
      expect(job.id).toBe(1);
      expect(job.title).toBe('Developpeur Java');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockJob);
  });

  it('should update a job', () => {
    const updated = { ...mockJob, title: 'Senior Java Developer' };

    service.update(1, updated).subscribe((job) => {
      expect(job.title).toBe('Senior Java Developer');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updated);
    req.flush(updated);
  });

  it('should partially update a job', () => {
    const patch: Partial<JobOffer> = { title: 'Lead Dev' };
    const patched = { ...mockJob, title: 'Lead Dev' };

    service.updatePartial(1, patch).subscribe((job) => {
      expect(job.title).toBe('Lead Dev');
      expect(job.company).toBe('TechCorp');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(patch);
    req.flush(patched);
  });

  it('should delete a job', () => {
    service.delete(1).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should return jobs by contract type', () => {
    service.getByContractType('CDI').subscribe((jobs) => {
      expect(jobs.length).toBe(1);
      expect(jobs[0].contractType).toBe('CDI');
    });

    const req = httpMock.expectOne(`${apiUrl}/contract/CDI`);
    expect(req.request.method).toBe('GET');
    req.flush([mockJob]);
  });

  it('should return jobs by status', () => {
    service.getByStatus('OPEN').subscribe((jobs) => {
      expect(jobs.length).toBe(1);
      expect(jobs[0].status).toBe('OPEN');
    });

    const req = httpMock.expectOne(`${apiUrl}/status/OPEN`);
    expect(req.request.method).toBe('GET');
    req.flush([mockJob]);
  });

  it('should return jobs by company', () => {
    service.getByCompany('TechCorp').subscribe((jobs) => {
      expect(jobs.length).toBe(1);
      expect(jobs[0].company).toBe('TechCorp');
    });

    const req = httpMock.expectOne(`${apiUrl}/company/TechCorp`);
    expect(req.request.method).toBe('GET');
    req.flush([mockJob]);
  });

  it('should return searched jobs', () => {
    service.search('java').subscribe((jobs) => {
      expect(jobs.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/search?keyword=java`);
    expect(req.request.method).toBe('GET');
    req.flush([mockJob]);
  });

  it('should return jobs in salary range', () => {
    service.getBySalaryRange(30000, 70000).subscribe((jobs) => {
      expect(jobs.length).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/salary?min=30000&max=70000`);
    expect(req.request.method).toBe('GET');
    req.flush([mockJob]);
  });

  it('should return open jobs', () => {
    service.getOpenJobs().subscribe((jobs) => {
      expect(jobs.length).toBe(1);
      expect(jobs[0].status).toBe('OPEN');
    });

    const req = httpMock.expectOne(`${apiUrl}/open`);
    expect(req.request.method).toBe('GET');
    req.flush([mockJob]);
  });
});
