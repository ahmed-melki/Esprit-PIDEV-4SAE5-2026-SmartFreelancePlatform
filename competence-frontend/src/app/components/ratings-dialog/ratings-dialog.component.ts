import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Skill, Rating } from '../../models/skill.model';
import { SkillService } from '../../services/skill.service';

export interface RatingsDialogData {
  skill: Skill;
}

@Component({
  selector: 'app-ratings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './ratings-dialog.component.html',
  styleUrls: ['./ratings-dialog.component.css'],
})
export class RatingsDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RatingsDialogComponent>);
  private readonly data = inject<RatingsDialogData>(MAT_DIALOG_DATA);
  private readonly skillService = inject(SkillService);

  readonly skill: Skill = this.data.skill;
  ratings: Rating[] = [];
  displayedColumns = ['note', 'commentaire', 'actions'];
  form: FormGroup;
  loading = true;
  adding = false;
  error: string | null = null;

  constructor() {
    this.form = this.fb.group({
      note: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      commentaire: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadRatings();
  }

  private loadRatings(): void {
    const id = this.skill.idSkill;
    if (id == null) {
      this.loading = false;
      return;
    }
    this.skillService.getRatingsBySkill(id).subscribe({
      next: (data: Rating[]) => {
        this.ratings = data ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'competence.ratingsLoadError';
        this.loading = false;
      },
    });
  }

  addRating(): void {
    if (this.form.invalid || this.adding) return;
    const id = this.skill.idSkill;
    if (id == null) return;
    this.adding = true;
    this.error = null;
    const value = this.form.value as Pick<Rating, 'note' | 'commentaire'>;
    this.skillService.addRating({ ...value }, id).subscribe({
      next: (rating: Rating) => {
        this.ratings = [...this.ratings, rating];
        this.form.reset({ note: 3, commentaire: '' });
        this.adding = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'competence.ratingAddError';
        this.adding = false;
      },
    });
  }

  deleteRating(rating: Rating): void {
    const id = rating.idRating;
    if (id == null) return;
    if (!confirm('Supprimer cette note ?')) return;
    this.skillService.deleteRating(id).subscribe({
      next: () => {
        this.ratings = this.ratings.filter(r => r.idRating !== id);
      },
      error: (err: any) => console.error(err),
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
