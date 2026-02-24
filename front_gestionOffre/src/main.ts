// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

import { routes } from './app/app.routes';

import { MatNativeDateModule } from '@angular/material/core';

bootstrapApplication(AppComponent, {
  providers: [

    provideRouter(routes),

    provideAnimations(),
  
    provideHttpClient(withInterceptorsFromDi()),
    
    importProvidersFrom(MatNativeDateModule)
  ]
}).catch(err => console.error(err));