import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CandidatureService } from './candidature.service';
import { Candidature, Entretien } from '../models/candidature.model';
import { JobOffer } from '../models/job.model';

describe('CandidatureService', () => {
  let service: CandidatureService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8052/api/candidatures';

  const mockJob: JobOffer = {
    id: 1,
    title: 'Developpeur Java',
    company: 'TechCorp'
  };

  const mockCandidature: Candidature = {
    id: 100,
    jobOffer: mockJob,
    candidatId: 5,
    statut: 'EN_ATTENTE',
    lettreMotivation: 'Je suis motive',
    cvUrl: 'https://cv.example.com/cv.pdf'
  };

  const mockEntretien: Entretien = {
    id: 200,
    candidature: mockCandidature,
    statut: 'PLANIFIE',
    dateHeure: '2026-04-25T10:00:00',
    lienVisio: 'https://meet.example.com/room',
    dureeMinutes: '60'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CandidatureService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(CandidatureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should apply to a job', () => {
    service.postuler(1, 5, 'Je suis motive', 'https://cv.example.com/cv.pdf').subscribe((candidature) => {
      expect(candidature.id).toBe(100);
      expect(candidature.statut).toBe('EN_ATTENTE');
    });

    const req = httpMock.expectOne(`${apiUrl}/postuler?jobId=1&candidatId=5`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      lettreMotivation: 'Je suis motive',
      cvUrl: 'https://cv.example.com/cv.pdf'
    });
    req.flush(mockCandidature);
  });

  it('should update candidature statut', () => {
    const updated = { ...mockCandidature, statut: 'ACCEPTEE', commentaireRecruteur: 'Excellent profil' as const };

    service.updateStatut(100, 'ACCEPTEE', 'Excellent profil').subscribe((candidature) => {
      expect(candidature.statut).toBe('ACCEPTEE');
      expect(candidature.commentaireRecruteur).toBe('Excellent profil');
    });

    const req = httpMock.expectOne(`${apiUrl}/100/statut`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ statut: 'ACCEPTEE', commentaire: 'Excellent profil' });
    req.flush(updated);
  });

  it('should get candidatures by job', () => {
    service.getCandidaturesByJob(1).subscribe((candidatures) => {
      expect(candidatures.length).toBe(1);
      expect(candidatures[0].id).toBe(100);
    });

    const req = httpMock.expectOne(`${apiUrl}/job/1`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCandidature]);
  });

  it('should get candidatures by candidat', () => {
    service.getMyCandidatures(5).subscribe((candidatures) => {
      expect(candidatures.length).toBe(1);
      expect(candidatures[0].candidatId).toBe(5);
    });

    const req = httpMock.expectOne(`${apiUrl}/candidat/5`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCandidature]);
  });

  it('should get candidature by id', () => {
    service.getCandidatureById(100).subscribe((candidature) => {
      expect(candidature.id).toBe(100);
      expect(candidature.statut).toBe('EN_ATTENTE');
    });

    const req = httpMock.expectOne(`${apiUrl}/100`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCandidature);
  });

  it('should get stats by job', () => {
    const stats = { total: 10, enAttente: 3, acceptees: 2, refusees: 2 };

    service.getStatsByJob(1).subscribe((response) => {
      expect(response['total']).toBe(10);
      expect(response['enAttente']).toBe(3);
      expect(response['acceptees']).toBe(2);
    });

    const req = httpMock.expectOne(`${apiUrl}/job/1/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(stats);
  });

  it('should plan an entretien', () => {
    service.planifierEntretien(100, '2026-04-25T10:00:00', 'https://meet.example.com/room').subscribe((entretien) => {
      expect(entretien.id).toBe(200);
      expect(entretien.statut).toBe('PLANIFIE');
      expect(entretien.lienVisio).toBe('https://meet.example.com/room');
    });

    const req = httpMock.expectOne(`${apiUrl}/100/entretien`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      dateHeure: '2026-04-25T10:00:00',
      lienVisio: 'https://meet.example.com/room'
    });
    req.flush(mockEntretien);
  });

  it('should get entretiens by candidature', () => {
    service.getEntretiensByCandidature(100).subscribe((entretiens) => {
      expect(entretiens.length).toBe(1);
      expect(entretiens[0].id).toBe(200);
      expect(entretiens[0].statut).toBe('PLANIFIE');
    });

    const req = httpMock.expectOne(`${apiUrl}/entretien/candidature/100`);
    expect(req.request.method).toBe('GET');
    req.flush([mockEntretien]);
  });
});
