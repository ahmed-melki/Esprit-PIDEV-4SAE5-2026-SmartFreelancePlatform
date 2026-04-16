import { TestBed } from '@angular/core/testing';
import { DemoAuthService } from './demo-auth.service';

describe('DemoAuthService', () => {
  let service: DemoAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DemoAuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should remove a corrupted session from localStorage', () => {
    localStorage.setItem('smartFreelanceDemoAuth', '{invalid json');

    const session = service.getSession();

    expect(session).toBeNull();
    expect(localStorage.getItem('smartFreelanceDemoAuth')).toBeNull();
  });

  it('should persist a normalized user session on login', async () => {
    await service.login('  learner@example.com  ', 'USER');

    const session = service.getSession();

    expect(session).not.toBeNull();
    expect(session?.email).toBe('learner@example.com');
    expect(session?.role).toBe('USER');
    expect(session?.userId).toBe(1);
    expect(session?.token.split('.').length).toBe(3);
    expect(service.getToken()).toBe(session?.token ?? null);
  });

  it('should fallback to the admin demo email and id', async () => {
    await service.login('', 'ADMIN');

    const session = service.getSession();

    expect(session?.email).toBe('admin@demo.local');
    expect(session?.role).toBe('ADMIN');
    expect(service.getUserId()).toBe(99);
    expect(service.getRole()).toBe('ADMIN');
  });
});
