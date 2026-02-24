import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    standalone: true,
    imports: [MatToolbar, MatToolbarRow, MatIcon, MatMenuTrigger, MatIconButton, MatMenu, MatMenuItem, RouterLink, MatDivider]
})
export class HeaderComponent {
  constructor(private router: Router) {}

  isProjectsRoute(): boolean {
    return this.router.url.includes('/projects');
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      console.log('Déconnexion...');
      this.router.navigate(['/login']);
    }
  }
}