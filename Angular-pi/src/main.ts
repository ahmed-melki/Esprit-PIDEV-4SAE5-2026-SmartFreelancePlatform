import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { routes } from './app/app.routes'; // tes routes standalone

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),             // remplace AppRoutingModule
    provideHttpClient(),
    importProvidersFrom(BrowserModule, FormsModule)
  ]
})
.catch(err => console.error(err));
