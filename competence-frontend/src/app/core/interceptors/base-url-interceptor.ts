import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';

export const BASE_URL = new InjectionToken<string>('BASE_URL');

@Injectable()
export class BaseUrlInterceptor implements HttpInterceptor {
  private readonly baseUrl = inject(BASE_URL, { optional: true });

  private hasScheme = (url: string) => this.baseUrl && new RegExp('^http(s)?://', 'i').test(url);

  /** Do not prepend baseUrl for static assets (i18n, menu, fonts, etc.) */
  private isAssetRequest(url: string): boolean {
    const normalized = url.replace(/^\.?\//, '');
    return normalized.startsWith('assets/');
  }

  /** Do not prepend if the URL already starts with baseUrl or /api/ (avoids double prefix) */
  private alreadyHasBaseUrl(url: string): boolean {
    const normalized = url.replace(/^\.?\//, '');
    return (
      (this.baseUrl != null && normalized.startsWith(this.baseUrl.replace(/^\//, ''))) ||
      normalized.startsWith('api/')
    );
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    if (
      this.hasScheme(request.url) ||
      this.isAssetRequest(request.url) ||
      this.alreadyHasBaseUrl(request.url)
    ) {
      return next.handle(request);
    }
    return next.handle(request.clone({ url: this.prependBaseUrl(request.url) }));
  }

  private prependBaseUrl(url: string) {
    return [this.baseUrl?.replace(/\/$/g, ''), url.replace(/^\.?\//, '')]
      .filter(val => val)
      .join('/');
  }
}
