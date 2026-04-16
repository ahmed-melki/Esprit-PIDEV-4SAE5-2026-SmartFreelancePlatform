import { Injectable } from '@angular/core';

export type DemoAppRole = 'ADMIN' | 'USER';

interface DemoSession {
  token: string;
  role: DemoAppRole;
  userId: number;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class DemoAuthService {
  private readonly storageKey = 'smartFreelanceDemoAuth';
  private readonly jwtSecret = 'VGhpc0lzQVN0cm9uZ0Rldk9ubHlKV1RTZWNyZXRLZXlGb3JTbWFydEZyZWVsYW5jZQ==';

  getSession(): DemoSession | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as DemoSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  getToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  getRole(): DemoAppRole | null {
    return this.getSession()?.role ?? null;
  }

  getUserId(): number {
    return this.getSession()?.userId ?? 1;
  }

  async login(email: string, role: DemoAppRole): Promise<void> {
    const normalizedEmail = email.trim() || `${role.toLowerCase()}@demo.local`;
    const userId = role === 'ADMIN' ? 99 : 1;
    const token = await this.createJwt(normalizedEmail, role);

    localStorage.setItem(this.storageKey, JSON.stringify({
      token,
      role,
      userId,
      email: normalizedEmail,
    } satisfies DemoSession));
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }

  private async createJwt(subject: string, role: DemoAppRole): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sub: subject,
      roles: [role],
      iat: Math.floor(Date.now() / 1000),
    };

    const encodedHeader = this.base64UrlEncodeJson(header);
    const encodedPayload = this.base64UrlEncodeJson(payload);
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = await this.sign(unsignedToken);

    return `${unsignedToken}.${signature}`;
  }

  private async sign(value: string): Promise<string> {
    const keyBytes = Uint8Array.from(atob(this.jwtSecret), char => char.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(value));
    return this.base64UrlEncodeBytes(new Uint8Array(signature));
  }

  private base64UrlEncodeJson(value: unknown): string {
    return this.base64UrlEncodeBytes(new TextEncoder().encode(JSON.stringify(value)));
  }

  private base64UrlEncodeBytes(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));

    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
}
