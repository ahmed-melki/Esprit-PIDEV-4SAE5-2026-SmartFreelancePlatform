import { HttpInterceptorFn } from '@angular/common/http';

const tokenKeys = [
  'smartFreelanceDemoAuth',
  'token',
  'authToken',
  'access_token',
  'jwt',
] as const;

function resolveToken(): string | null {
  for (const key of tokenKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    if (key === 'smartFreelanceDemoAuth') {
      try {
        return (JSON.parse(raw) as { token?: string }).token ?? null;
      } catch {
        return null;
      }
    }

    return raw;
  }

  return null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = resolveToken();
  if (!token) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  }));
};
