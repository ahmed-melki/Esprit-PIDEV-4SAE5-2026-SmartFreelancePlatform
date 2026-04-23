import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Project } from '../models/project.model';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:8045/api/projects'; 

  constructor(private http: HttpClient) { }

  private isProject(value: unknown): value is Project {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const item = value as Record<string, unknown>;
    return (
      typeof item['title'] === 'string' &&
      typeof item['description'] === 'string' &&
      typeof item['budget'] === 'number'
    );
  }

  private collectProjectsDeep(payload: unknown): Project[] {
    const stack: unknown[] = [payload];
    const collected: Project[] = [];
    const maxNodes = 20000;
    let visitedNodes = 0;

    while (stack.length > 0 && visitedNodes < maxNodes) {
      const node = stack.pop();
      visitedNodes++;

      if (!node) continue;

      if (Array.isArray(node)) {
        for (const item of node) stack.push(item);
        continue;
      }

      if (typeof node !== 'object') continue;

      if (this.isProject(node)) {
        collected.push(node);
      }

      const record = node as Record<string, unknown>;
      for (const value of Object.values(record)) {
        if (Array.isArray(value) || (value && typeof value === 'object')) {
          stack.push(value);
        }
      }
    }

    const deduped = new Map<string, Project>();
    for (const project of collected) {
      const key = project.id != null
        ? `id:${project.id}`
        : `title:${project.title}|deadline:${project.deadline ?? ''}|budget:${project.budget}`;
      if (!deduped.has(key)) {
        deduped.set(key, project);
      }
    }

    return Array.from(deduped.values());
  }

  private normalizeProjectsResponse(payload: unknown): Project[] {
    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload);
        return this.normalizeProjectsResponse(parsed);
      } catch {
        return [];
      }
    }

    if (Array.isArray(payload)) {
      const fromArray = this.collectProjectsDeep(payload);
      return fromArray.length > 0 ? fromArray : (payload as Project[]);
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const wrapped = payload as Record<string, unknown>;
    const listKeys = ['projects', 'content', 'data', 'items', 'results'];

    for (const key of listKeys) {
      if (Array.isArray(wrapped[key])) {
        return wrapped[key] as Project[];
      }
    }

    // Spring HAL style: { _embedded: { projects: [...] } }
    const embedded = wrapped['_embedded'];
    if (embedded && typeof embedded === 'object') {
      const embeddedObj = embedded as Record<string, unknown>;
      for (const value of Object.values(embeddedObj)) {
        if (Array.isArray(value)) {
          return value as Project[];
        }
      }
    }

    // Fallback for APIs returning a single project object.
    if (this.isProject(wrapped)) {
      return [wrapped];
    }

    const deepProjects = this.collectProjectsDeep(payload);
    if (deepProjects.length > 0) {
      return deepProjects;
    }

    return [];
  }

  getProjects(): Observable<Project[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '100')
      .set('sort', 'id,desc');

    return this.http.get<unknown>(this.apiUrl, { params }).pipe(
      map((response) => this.normalizeProjectsResponse(response))
    );
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  updateProjectPartial(id: number, updates: Partial<Project>): Observable<Project> {
    return this.http.patch<Project>(`${this.apiUrl}/${id}`, updates);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMatchingProjects(userId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/matching/${userId}`);
  }
}
