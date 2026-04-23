import { Injectable } from '@angular/core';

export interface Client {
  id: number;
  name: string;
}

export interface Freelance {
  id: number;
  name: string;
}

export interface Project {
  id: number;
  name: string;
  freelanceId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  clients: Client[] = [
    { id: 1, name: 'Jean Dupont (Client)' },
    { id: 2, name: 'Sophie Martin (Client)' },
    { id: 3, name: 'Entreprise ABC' }
  ];

  freelances: Freelance[] = [
    { id: 1, name: 'Dev Frontend Angular' },
    { id: 2, name: 'Expert Spring Boot' },
    { id: 3, name: 'Data Scientist Python' },
    { id: 4, name: 'Développeur .NET' }
  ];

  projets: Project[] = [
    { id: 1, name: 'Site e-commerce Angular', freelanceId: 1 },
    { id: 2, name: 'Dashboard React', freelanceId: 1 },
    { id: 3, name: 'API REST Spring Boot', freelanceId: 2 },
    { id: 4, name: 'Microservices Java', freelanceId: 2 },
    { id: 5, name: 'Pipeline Data Python', freelanceId: 3 },
    { id: 6, name: 'Analyse ML', freelanceId: 3 },
    { id: 7, name: 'Application .NET Core', freelanceId: 4 }
  ];

  getClientName(id: number): string {
    const client = this.clients.find(c => c.id === id);
    return client ? client.name : `Client ${id}`;
  }

  getFreelanceName(id: number): string {
    const freelance = this.freelances.find(f => f.id === id);
    return freelance ? freelance.name : `Freelance ${id}`;
  }

  getProjectName(id: number): string {
    const project = this.projets.find(p => p.id === id);
    return project ? project.name : `Projet ${id}`;
  }
}

