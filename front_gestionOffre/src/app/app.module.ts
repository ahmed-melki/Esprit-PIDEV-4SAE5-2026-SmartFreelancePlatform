import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material - Modules essentiels
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
// Angular Material - Modules MANQUANTS (TRÈS IMPORTANTS)
import { MatMenuModule } from '@angular/material/menu';         // Pour les menus déroulants
import { MatDividerModule } from '@angular/material/divider';   // Pour les séparateurs
import { MatSelectModule } from '@angular/material/select';     // Pour les selects dans les formulaires
import { MatDatepickerModule } from '@angular/material/datepicker'; // Pour les dates
import { MatNativeDateModule } from '@angular/material/core';   // Pour le datepicker
import { MatBadgeModule } from '@angular/material/badge';       // Pour les badges de notification
import { MatTooltipModule } from '@angular/material/tooltip';   // Pour les infobulles
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Pour les chargements

// Composants
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectFormComponent } from './projects/project-form/project-form.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ProjectListComponent,
    ProjectFormComponent
  ],
  imports: [
    // Modules de base Angular
    BrowserModule,
    BrowserAnimationsModule,    // OBLIGATOIRE pour Angular Material
    HttpClientModule,
    AppRoutingModule,
    FormsModule,                // POUR ngModel
    RouterModule,
    
    // Angular Material COMPLET
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,              // AJOUTÉ - Pour menus déroulants
    MatDividerModule,           // AJOUTÉ - Pour séparateurs
    MatSelectModule,            // AJOUTÉ - Pour selects
    MatDatepickerModule,        // AJOUTÉ - Pour dates
    MatNativeDateModule,        // AJOUTÉ - Pour datepicker
    MatBadgeModule,             // AJOUTÉ - Pour badges
    MatTooltipModule,           // AJOUTÉ - Pour infobulles
    MatProgressSpinnerModule    // AJOUTÉ - Pour loading
  ],
  providers: [MatDatepickerModule,],
  bootstrap: [AppComponent]
})
export class AppModule {
    constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    // Enregistre les icônes par défaut de Material
    this.matIconRegistry.setDefaultFontSetClass('material-icons');
  }
 }