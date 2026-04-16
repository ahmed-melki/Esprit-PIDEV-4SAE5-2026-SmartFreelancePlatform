import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { TrainingService } from '../../services/training.service';
import { CertificationService } from '../../services/certification.service';
import { Training, Certification } from '../../models/models';

type AccessRole = 'ADMIN' | 'USER';
type DurationUnit = 'HOURS' | 'DAYS' | 'WEEKS';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './training.component.html'
})
export class TrainingComponent implements OnInit, AfterViewInit {

  trainings: Training[] = [];
  trainingDataSource = new MatTableDataSource<Training>([]);
  displayedColumns = ['title', 'category', 'duration', 'dates', 'status', 'actions'];
  certifications: Certification[] = [];
  showForm = false;
  accessRole: AccessRole = 'USER';
  durationAmount = 1;
  durationUnit: DurationUnit = 'DAYS';
  trainingStartDate: Date | null = null;
  trainingEndDate: Date | null = null;
  saveError = '';
  deleteError = '';
  isSaving = false;
  readonly pageSize = 8;
  readonly Math = Math;
  userPage = 1;
  adminPage = 1;
  readonly viewRoutes = {
    USER: '/learning/user/trainings',
    ADMIN: '/learning/admin/trainings',
  } as const;

  training: Training = this.emptyTraining();

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private route: ActivatedRoute,
    private trainingService: TrainingService,
    private certificationService: CertificationService
  ) {}

  ngOnInit() {
    this.accessRole = this.route.snapshot.data['accessRole'] === 'ADMIN' ? 'ADMIN' : 'USER';
    this.updateDisplayedColumns();

    this.trainingDataSource.filterPredicate = (training, filter) => {
      const value = [
        training.title,
        training.category,
        training.status,
        training.description,
      ].join(' ').toLowerCase();

      return value.includes(filter);
    };
    this.loadTrainings();
    this.loadCertifications();
  }

  ngAfterViewInit() {
    this.trainingDataSource.paginator = this.paginator ?? null;
    this.trainingDataSource.sort = this.sort ?? null;
  }

  emptyTraining(): Training {
    return {
      title: '',
      description: '',
      category: '',
      durationHours: 8,
      startDate: null,
      endDate: null,
      status: null
    };
  }

  loadTrainings() {
    this.trainingService.getAll()
      .subscribe(
        (data) => {
          this.trainings = data;
          this.trainingDataSource.data = data;
          this.updateDisplayedColumns();
          this.deleteError = '';
          this.userPage = 1;
          this.adminPage = 1;
        },
        (error) => {
          this.deleteError = this.extractErrorMessage(error, 'Unable to load trainings right now.');
          console.error('Failed to load trainings', error);
        }
      );
  }

  loadCertifications() {
    this.certificationService.getAll()
      .subscribe(
        (data) => {
          this.certifications = data;
        },
        (error) => console.error('Failed to load certifications', error)
      );
  }

  save() {
    this.updateDurationHours();
    this.updateTrainingEndDate();
    this.saveError = '';
    this.isSaving = true;

    const payload: Training = {
      ...this.training,
      title: this.training.title?.trim(),
      description: this.training.description?.trim(),
      category: this.training.category?.trim(),
      durationHours: this.training.durationHours ?? 0,
      startDate: this.training.startDate || null,
      endDate: this.training.endDate || null,
      status: this.training.status || null,
    };

    if (this.training.id) {
      this.trainingService.update(this.training.id, payload)
        .subscribe(
          () => {
            this.loadTrainings();
            this.resetForm();
          },
          (error) => {
            this.saveError = this.extractErrorMessage(error, 'Training update failed.');
            this.isSaving = false;
            console.error('Update failed', error);
          }
        );
    } else {
      this.trainingService.create(payload)
        .subscribe(
          () => {
            this.loadTrainings();
            this.resetForm();
          },
          (error) => {
            this.saveError = this.extractErrorMessage(error, 'Training creation failed.');
            this.isSaving = false;
            console.error('Create failed', error);
          }
        );
    }
  }

  edit(t: Training) {
    this.training = { ...t };
    this.trainingStartDate = this.parseDate(t.startDate);
    this.trainingEndDate = this.parseDate(t.endDate);
    this.syncDurationControlsFromHours(t.durationHours);
    this.saveError = '';
    this.deleteError = '';
    this.showForm = true;
  }

  delete(id?: number) {
    if (!id) return;
    this.trainingService.delete(id)
      .subscribe(
        () => {
          this.loadTrainings();
        },
        (error) => {
          this.deleteError = this.extractErrorMessage(error, 'Training deletion failed.');
          console.error('Delete failed', error);
        }
      );
  }

  resetForm() {
    this.training = this.emptyTraining();
    this.durationAmount = 1;
    this.durationUnit = 'DAYS';
    this.trainingStartDate = null;
    this.trainingEndDate = null;
    this.saveError = '';
    this.isSaving = false;
    this.showForm = false;
  }

  startCreate() {
    this.training = this.emptyTraining();
    this.durationAmount = 1;
    this.durationUnit = 'DAYS';
    this.trainingStartDate = null;
    this.trainingEndDate = null;
    this.saveError = '';
    this.deleteError = '';
    this.showForm = true;
  }

  applyFilter(value: string) {
    this.trainingDataSource.filter = value.trim().toLowerCase();
    this.trainingDataSource.paginator?.firstPage();
  }

  get isAdmin() {
    return this.accessRole === 'ADMIN';
  }

  get activeTrainingsCount() {
    return this.trainings.filter(t => ['ONGOING', 'UPCOMING'].includes(t.status || '')).length;
  }

  get completedTrainingsCount() {
    return this.trainings.filter(t => t.status === 'COMPLETED').length;
  }

  get linkedCertificationCount() {
    return this.certifications.filter(certification => !!certification.training?.id).length;
  }

  get upcomingTrainings() {
    return this.trainings
      .filter(t => t.status !== 'CANCELLED')
      .slice()
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  }

  get pagedUpcomingTrainings() {
    return this.paginate(this.upcomingTrainings, this.userPage);
  }

  get upcomingTrainingsTotalPages() {
    return this.getTotalPages(this.upcomingTrainings.length);
  }

  get adminTrainings() {
    return this.trainings
      .slice()
      .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
  }

  get pagedAdminTrainings() {
    return this.paginate(this.adminTrainings, this.adminPage);
  }

  get adminTrainingsTotalPages() {
    return this.getTotalPages(this.adminTrainings.length);
  }

  get upcomingTrainingPageNumbers() {
    return this.getPageNumbers(this.upcomingTrainingsTotalPages);
  }

  get adminTrainingPageNumbers() {
    return this.getPageNumbers(this.adminTrainingsTotalPages);
  }

  onDurationChange() {
    this.updateDurationHours();
    this.updateTrainingEndDate();
  }

  onTrainingStartDateChange(value: Date | null) {
    this.trainingStartDate = value;
    this.training.startDate = this.toIsoDate(value);
    this.updateTrainingEndDate();
  }

  formatDuration(hours?: number | null) {
    if (!hours) {
      return 'Not planned';
    }

    if (hours % 40 === 0) {
      const weeks = hours / 40;
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    }

    if (hours % 8 === 0) {
      const days = hours / 8;
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    }

    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  formatDate(value?: string | null) {
    return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value)) : 'Not scheduled';
  }

  goToUserPage(page: number) {
    this.userPage = this.clampPage(page, this.upcomingTrainingsTotalPages);
  }

  goToAdminPage(page: number) {
    this.adminPage = this.clampPage(page, this.adminTrainingsTotalPages);
  }

  private updateDisplayedColumns() {
    this.displayedColumns = this.isAdmin
      ? ['title', 'category', 'duration', 'dates', 'status', 'actions']
      : ['title', 'category', 'duration', 'dates', 'status'];
  }

  private updateDurationHours() {
    const amount = Number(this.durationAmount) || 0;
    const multiplier = this.durationUnit === 'WEEKS' ? 40 : this.durationUnit === 'DAYS' ? 8 : 1;
    this.training.durationHours = amount * multiplier;
  }

  private updateTrainingEndDate() {
    if (!this.trainingStartDate || !this.training.durationHours) {
      this.trainingEndDate = null;
      this.training.endDate = null;
      return;
    }

    const spanDays = Math.max(1, Math.ceil(this.training.durationHours / 8));
    const end = new Date(this.trainingStartDate);
    end.setDate(end.getDate() + spanDays - 1);
    this.trainingEndDate = end;
    this.training.endDate = this.toIsoDate(end);
  }

  private syncDurationControlsFromHours(hours?: number | null) {
    const value = hours || 8;
    if (value % 40 === 0) {
      this.durationAmount = value / 40;
      this.durationUnit = 'WEEKS';
    } else if (value % 8 === 0) {
      this.durationAmount = value / 8;
      this.durationUnit = 'DAYS';
    } else {
      this.durationAmount = value;
      this.durationUnit = 'HOURS';
    }
  }

  private parseDate(value?: string | null) {
    return value ? new Date(value) : null;
  }

  private toIsoDate(value: Date | null) {
    if (!value) {
      return null;
    }

    const offsetDate = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return offsetDate.toISOString().slice(0, 10);
  }

  private paginate<T>(items: T[], page: number) {
    const start = (page - 1) * this.pageSize;
    return items.slice(start, start + this.pageSize);
  }

  private getTotalPages(totalItems: number) {
    return Math.max(1, Math.ceil(totalItems / this.pageSize));
  }

  private getPageNumbers(totalPages: number) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  private clampPage(page: number, totalPages: number) {
    return Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  }

  private extractErrorMessage(error: unknown, fallback: string) {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error?.message) {
        return error.error.message as string;
      }
    }

    return fallback;
  }
}
