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
import { CertificationService } from '../../services/certification.service';
import { TrainingService } from '../../services/training.service';
import { Certification, Training } from '../../models/models';
import { CurrentUserService } from '../../core/services/current-user.service';

type AccessRole = 'ADMIN' | 'USER';
type ValidityUnit = 'MONTHS' | 'YEARS';

@Component({
  selector: 'app-certification',
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
  templateUrl: './certification.component.html'
})
export class CertificationComponent implements OnInit, AfterViewInit {

  certifications: Certification[] = [];
  certificationDataSource = new MatTableDataSource<Certification>([]);
  displayedColumns = ['number', 'training', 'status', 'grade', 'score', 'dates', 'actions'];
  trainings: Training[] = [];
  showForm = false;

  certification: Certification = this.emptyCertification();
  selectedTrainingId: number | null = null;
  selectedClientId: number | null = null;
  accessRole: AccessRole = 'USER';
  issueDate: Date | null = null;
  expiryDate: Date | null = null;
  validityAmount = 1;
  validityUnit: ValidityUnit = 'YEARS';
  saveError = '';
  deleteError = '';
  isSaving = false;
  readonly pageSize = 8;
  readonly Math = Math;
  userPage = 1;
  adminPage = 1;
  readonly viewRoutes = {
    USER: '/learning/user/certifications',
    ADMIN: '/learning/admin/certifications',
  } as const;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private route: ActivatedRoute,
    private certificationService: CertificationService,
    private trainingService: TrainingService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit() {
    this.accessRole = this.route.snapshot.data['accessRole'] === 'ADMIN' ? 'ADMIN' : 'USER';
    this.updateDisplayedColumns();

    this.certificationDataSource.filterPredicate = (certification, filter) => {
      const value = [
        certification.certificateNumber,
        certification.status,
        certification.grade,
        certification.score,
        certification.clientId,
      ].join(' ').toLowerCase();

      return value.includes(filter);
    };
    this.loadCertifications();
    this.loadTrainings();
  }

  ngAfterViewInit() {
    this.certificationDataSource.paginator = this.paginator ?? null;
    this.certificationDataSource.sort = this.sort ?? null;
  }

  emptyCertification(): Certification {
    return {
      certificateNumber: '',
      issueDate: null,
      expiryDate: null,
      status: null,
      grade: '',
      score: null
    };
  }

  loadCertifications() {
    const request$ = this.isAdmin
      ? this.certificationService.getAll()
      : this.certificationService.getByClient(this.currentUserService.getCurrentUserId());

    request$.subscribe(
      (data) => {
        this.certifications = data;
        this.certificationDataSource.data = data;
        this.updateDisplayedColumns();
        this.deleteError = '';
        this.userPage = 1;
        this.adminPage = 1;
      },
      (error) => {
        this.deleteError = this.extractErrorMessage(error, 'Unable to load certifications right now.');
        console.error('Failed to load certifications', error);
      }
    );
  }

  loadTrainings() {
    this.trainingService.getAll()
      .subscribe(
        (data) => {
          this.trainings = data;
        },
        (error) => console.error('Failed to load trainings', error)
      );
  }

  save() {
    this.updateExpiryDate();
    this.saveError = '';
    this.isSaving = true;

    if (!this.selectedTrainingId) {
      this.saveError = 'Please select a training before saving.';
      this.isSaving = false;
      return;
    }

    const clientId = this.selectedClientId || this.currentUserService.getCurrentUserId();
    if (!clientId) {
      this.saveError = 'Please provide a client id before saving.';
      this.isSaving = false;
      return;
    }

    const payload: Certification = {
      ...this.certification,
      certificateNumber: this.certification.certificateNumber?.trim(),
      issueDate: this.certification.issueDate || null,
      expiryDate: this.certification.expiryDate || null,
      status: this.certification.status || null,
      grade: this.certification.grade?.trim(),
      score: this.certification.score ?? null,
      clientId,
    };

    if (this.certification.id) {
      this.certificationService.update(this.certification.id, payload, clientId, this.selectedTrainingId!)
        .subscribe(
          () => {
            this.loadCertifications();
            this.resetForm();
          },
          (error) => {
            this.saveError = this.extractErrorMessage(error, 'Certification update failed.');
            this.isSaving = false;
            console.error('Update failed', error);
          }
        );
    } else {
      this.certificationService.create(payload, clientId, this.selectedTrainingId!)
        .subscribe(
          () => {
            this.loadCertifications();
            this.resetForm();
          },
          (error) => {
            this.saveError = this.extractErrorMessage(error, 'Certification creation failed.');
            this.isSaving = false;
            console.error('Create failed', error);
          }
        );
    }
  }

  edit(cert: Certification) {
    this.certification = { ...cert };
    this.selectedClientId = cert.clientId ?? null;
    this.selectedTrainingId = cert.training?.id ?? null;
    this.issueDate = this.parseDate(cert.issueDate);
    this.expiryDate = this.parseDate(cert.expiryDate);
    this.syncValidityControls();
    this.saveError = '';
    this.deleteError = '';
    this.showForm = true;
  }

  delete(id?: number) {
    if (!id) return;
    this.certificationService.delete(id)
      .subscribe(
        () => {
          this.loadCertifications();
        },
        (error) => {
          this.deleteError = this.extractErrorMessage(error, 'Certification deletion failed.');
          console.error('Delete failed', error);
        }
      );
  }

  resetForm() {
    this.certification = this.emptyCertification();
    this.selectedTrainingId = null;
    this.selectedClientId = null;
    this.issueDate = null;
    this.expiryDate = null;
    this.validityAmount = 1;
    this.validityUnit = 'YEARS';
    this.saveError = '';
    this.isSaving = false;
    this.showForm = false;
  }

  startCreate() {
    this.certification = this.emptyCertification();
    this.selectedTrainingId = null;
    this.selectedClientId = this.currentUserService.getCurrentUserId();
    this.issueDate = null;
    this.expiryDate = null;
    this.validityAmount = 1;
    this.validityUnit = 'YEARS';
    this.saveError = '';
    this.deleteError = '';
    this.showForm = true;
  }

  applyFilter(value: string) {
    this.certificationDataSource.filter = value.trim().toLowerCase();
    this.certificationDataSource.paginator?.firstPage();
  }

  get isAdmin() {
    return this.accessRole === 'ADMIN';
  }

  get issuedCertificationsCount() {
    return this.certifications.filter(c => c.status === 'ISSUED').length;
  }

  get pendingCertificationsCount() {
    return this.certifications.filter(c => c.status === 'PENDING' || !c.status).length;
  }

  get averageScore() {
    const scores = this.certifications
      .map(c => c.score)
      .filter((score): score is number => typeof score === 'number');

    if (!scores.length) {
      return 0;
    }

    return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
  }

  get userCertifications() {
    return this.certifications.filter(c => c.status !== 'REVOKED');
  }

  get pagedUserCertifications() {
    return this.paginate(this.userCertifications, this.userPage);
  }

  get userCertificationsTotalPages() {
    return this.getTotalPages(this.userCertifications.length);
  }

  get adminCertifications() {
    return this.certifications
      .slice()
      .sort((a, b) => (a.issueDate || '').localeCompare(b.issueDate || ''));
  }

  get pagedAdminCertifications() {
    return this.paginate(this.adminCertifications, this.adminPage);
  }

  get adminCertificationsTotalPages() {
    return this.getTotalPages(this.adminCertifications.length);
  }

  get userCertificationPageNumbers() {
    return this.getPageNumbers(this.userCertificationsTotalPages);
  }

  get adminCertificationPageNumbers() {
    return this.getPageNumbers(this.adminCertificationsTotalPages);
  }

  onIssueDateChange(value: Date | null) {
    this.issueDate = value;
    this.certification.issueDate = this.toIsoDate(value);
    this.updateExpiryDate();
  }

  onValidityChange() {
    this.updateExpiryDate();
  }

  formatDate(value?: string | null) {
    return value ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(value)) : 'Not set';
  }

  formatValidity() {
    const unit = this.validityUnit === 'YEARS'
      ? this.validityAmount === 1 ? 'year' : 'years'
      : this.validityAmount === 1 ? 'month' : 'months';

    return `${this.validityAmount || 0} ${unit}`;
  }

  goToUserPage(page: number) {
    this.userPage = this.clampPage(page, this.userCertificationsTotalPages);
  }

  goToAdminPage(page: number) {
    this.adminPage = this.clampPage(page, this.adminCertificationsTotalPages);
  }

  private updateDisplayedColumns() {
    this.displayedColumns = this.isAdmin
      ? ['number', 'training', 'status', 'grade', 'score', 'dates', 'actions']
      : ['number', 'training', 'status', 'grade', 'score', 'dates'];
  }

  private updateExpiryDate() {
    if (!this.issueDate || !this.validityAmount) {
      this.expiryDate = null;
      this.certification.expiryDate = null;
      return;
    }

    const expiry = new Date(this.issueDate);
    if (this.validityUnit === 'YEARS') {
      expiry.setFullYear(expiry.getFullYear() + Number(this.validityAmount));
    } else {
      expiry.setMonth(expiry.getMonth() + Number(this.validityAmount));
    }

    this.expiryDate = expiry;
    this.certification.expiryDate = this.toIsoDate(expiry);
  }

  private syncValidityControls() {
    if (!this.issueDate || !this.expiryDate) {
      this.validityAmount = 1;
      this.validityUnit = 'YEARS';
      return;
    }

    const monthDiff = (this.expiryDate.getFullYear() - this.issueDate.getFullYear()) * 12
      + this.expiryDate.getMonth()
      - this.issueDate.getMonth();

    if (monthDiff > 0 && monthDiff % 12 === 0) {
      this.validityAmount = monthDiff / 12;
      this.validityUnit = 'YEARS';
    } else {
      this.validityAmount = Math.max(1, monthDiff);
      this.validityUnit = 'MONTHS';
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
