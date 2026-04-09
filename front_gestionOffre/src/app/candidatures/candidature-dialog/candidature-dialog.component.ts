import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';  
import { CandidatureService } from '../../candidatures/candidature.service';

@Component({
  selector: 'app-candidature-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressBarModule  // ← AJOUTER ICI
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon class="title-icon">description</mat-icon>
      Postuler à l'offre
    </h2>

    <mat-dialog-content class="dialog-content">
      <div class="job-info" *ngIf="data.job">
        <p><strong>{{ data.job.title }}</strong></p>
        <p class="company">{{ data.job.company }} • {{ data.job.location }}</p>
      </div>

      <mat-divider></mat-divider>

      <!-- Lettre de motivation -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Lettre de motivation</mat-label>
        <textarea matInput 
                  [(ngModel)]="lettreMotivation" 
                  #lettre="ngModel"
                  rows="6" 
                  required 
                  minlength="50"
                  maxlength="2000"
                  placeholder="Décrivez votre motivation, vos compétences et pourquoi vous êtes le candidat idéal..."></textarea>
        <mat-icon matSuffix>description</mat-icon>
        
        <mat-error *ngIf="lettre.invalid && lettre.touched">
          <span *ngIf="lettre.errors?.['required']">La lettre de motivation est requise</span>
          <span *ngIf="lettre.errors?.['minlength']">Minimum 50 caractères</span>
        </mat-error>
        
        <mat-hint align="end">{{ lettreMotivation.length || 0 }}/2000</mat-hint>
      </mat-form-field>

      <!-- Upload CV -->
      <div class="upload-section">
        <label>Votre CV (PDF, DOC, DOCX)</label>
        <div class="upload-area" (click)="fileInput.click()">
          <input type="file" #fileInput hidden accept=".pdf,.doc,.docx" (change)="onFileSelected($event)">
          <mat-icon>cloud_upload</mat-icon>
          <span>{{ fileName || 'Cliquez pour sélectionner un fichier' }}</span>
        </div>
        <div class="upload-progress" *ngIf="uploading">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
          <p>Upload en cours...</p>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button (click)="cancel()">
        <mat-icon>cancel</mat-icon> Annuler
      </button>
      <button mat-raised-button 
              color="primary" 
              (click)="submit()"
              [disabled]="!isFormValid() || uploading">
        <mat-icon>send</mat-icon> Envoyer ma candidature
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #2c3e50;
    }
    .title-icon {
      color: #9b59b6;
    }
    .dialog-content {
      min-width: 500px;
      padding: 0 24px 20px;
    }
    .job-info {
      margin-bottom: 16px;
    }
    .job-info p {
      margin: 0;
    }
    .company {
      color: #7f8c8d;
      font-size: 13px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    .upload-section {
      margin-top: 16px;
    }
    .upload-section label {
      display: block;
      margin-bottom: 8px;
      color: #2c3e50;
      font-weight: 500;
    }
    .upload-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    .upload-area:hover {
      border-color: #9b59b6;
      background: #faf0ff;
    }
    .upload-area mat-icon {
      color: #9b59b6;
    }
    .upload-area span {
      color: #7f8c8d;
    }
    .upload-progress {
      margin-top: 16px;
    }
    .upload-progress p {
      margin-top: 8px;
      color: #7f8c8d;
      font-size: 12px;
      text-align: center;
    }
    .dialog-actions {
      padding: 16px 24px;
      gap: 12px;
    }
    @media (max-width: 768px) {
      .dialog-content {
        min-width: auto;
      }
    }
  `]
})
export class CandidatureDialogComponent {
  lettreMotivation: string = '';
  cvFile: File | null = null;
  fileName: string = '';
  uploading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<CandidatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: any, userId: number },
    private candidatureService: CandidatureService,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('Format non supporté. Veuillez uploader un PDF ou DOC.', 'Fermer', { duration: 3000 });
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Fichier trop volumineux (max 5MB).', 'Fermer', { duration: 3000 });
        return;
      }
      
      this.cvFile = file;
      this.fileName = file.name;
    }
  }

  isFormValid(): boolean {
    return this.lettreMotivation.length >= 50 && !!this.cvFile;
  }

  submit(): void {
    if (!this.isFormValid()) return;
    
    this.uploading = true;
    
    this.candidatureService.postulerAvecFichier(
      this.data.job.id, 
      this.data.userId, 
      this.lettreMotivation, 
      this.cvFile!
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Candidature envoyée avec succès !', 'Fermer', { duration: 5000 });
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        let message = 'Erreur lors de l\'envoi de la candidature';
        if (err.error?.message) {
          message = err.error.message;
        } else if (err.message) {
          message = err.message;
        }
        this.snackBar.open(`❌ ${message}`, 'Fermer', { duration: 5000 });
        this.uploading = false;
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}