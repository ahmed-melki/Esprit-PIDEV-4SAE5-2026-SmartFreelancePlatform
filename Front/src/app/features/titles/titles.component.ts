import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TitleService } from '../../services/title.service';
import { Title, UserTitle } from '../../models/models';
import { CurrentUserService } from '../../core/services/current-user.service';
import { DemoAuthService } from '../../core/services/demo-auth.service';

@Component({
  selector: 'app-titles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './titles.component.html'
})
export class TitlesComponent implements OnInit {
  userTitles: UserTitle[] = [];
  availableTitles: Title[] = [];
  loading = false;
  currentClientId: number = 1;
  readonly pageSize = 8;
  readonly Math = Math;
  userTitlesPage = 1;
  availableTitlesPage = 1;

  constructor(
    private titleService: TitleService,
    private currentUserService: CurrentUserService,
    private demoAuthService: DemoAuthService
  ) {}

  ngOnInit(): void {
    this.currentClientId = this.currentUserService.getCurrentUserId();
    this.loadUserTitles();
    this.loadAvailableTitles();
    if (this.demoAuthService.getRole() === 'ADMIN') {
      this.initializeTitles();
    }
  }

  loadUserTitles(): void {
    this.loading = true;
    this.titleService.getUserTitles(this.currentClientId).subscribe({
      next: (titles) => {
        this.userTitles = titles;
        this.userTitlesPage = 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user titles:', error);
        this.loading = false;
      }
    });
  }

  loadAvailableTitles(): void {
    this.titleService.getAllTitles().subscribe({
      next: (titles) => {
        this.availableTitles = titles;
        this.availableTitlesPage = 1;
      },
      error: (error) => {
        console.error('Error loading available titles:', error);
      }
    });
  }

  checkForNewTitles(): void {
    this.titleService.checkAndUnlockTitles(this.currentClientId).subscribe({
      next: (unlockedTitles) => {
        if (unlockedTitles.length > 0) {
          this.loadUserTitles();
        }
      },
      error: (error) => {
        console.error('Error checking for new titles:', error);
      }
    });
  }

  initializeTitles(): void {
    this.titleService.initializeTitles().subscribe({
      next: () => {},
      error: (error) => {
        console.error('Error initializing titles:', error);
      }
    });
  }

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'COMMON': return '#808080';
      case 'RARE': return '#0066cc';
      case 'EPIC': return '#9933cc';
      case 'LEGENDARY': return '#ff9900';
      default: return '#808080';
    }
  }

  getRarityIcon(rarity: string): string {
    switch (rarity) {
      case 'COMMON': return 'star';
      case 'RARE': return 'diamond';
      case 'EPIC': return 'workspace_premium';
      case 'LEGENDARY': return 'local_fire_department';
      default: return 'star';
    }
  }

  isTitleUnlocked(titleId: number): boolean {
    return this.userTitles.some(ut => ut.title.id === titleId);
  }

  get pagedUserTitles() {
    return this.paginate(this.userTitles, this.userTitlesPage);
  }

  get pagedAvailableTitles() {
    return this.paginate(this.availableTitles, this.availableTitlesPage);
  }

  get userTitlesTotalPages() {
    return this.getTotalPages(this.userTitles.length);
  }

  get availableTitlesTotalPages() {
    return this.getTotalPages(this.availableTitles.length);
  }

  get userTitlePageNumbers() {
    return this.getPageNumbers(this.userTitlesTotalPages);
  }

  get availableTitlePageNumbers() {
    return this.getPageNumbers(this.availableTitlesTotalPages);
  }

  goToUserTitlesPage(page: number): void {
    this.userTitlesPage = this.clampPage(page, this.userTitlesTotalPages);
  }

  goToAvailableTitlesPage(page: number): void {
    this.availableTitlesPage = this.clampPage(page, this.availableTitlesTotalPages);
  }

  private paginate<T>(items: T[], page: number): T[] {
    const start = (page - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  }

  private getTotalPages(totalItems: number): number {
    return Math.max(1, Math.ceil(totalItems / this.pageSize));
  }

  private getPageNumbers(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  private clampPage(page: number, totalPages: number): number {
    return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  }
}
