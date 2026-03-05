import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Skill, NiveauSkill } from '../../models/skill.model';
import { SkillService } from '../../services/skill.service';

export interface SkillFormDialogData {
  /** Null = création, sinon édition */
  skill: Skill | null;
}

@Component({
  selector: 'app-skill-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './skill-form-dialog.component.html',
  styleUrls: ['./skill-form-dialog.component.css'],
})
export class SkillFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<SkillFormDialogComponent>);
  private readonly data = inject<SkillFormDialogData>(MAT_DIALOG_DATA);
  private readonly skillService = inject(SkillService);

  readonly isEdit = !!this.data?.skill;
  readonly niveaux = Object.values(NiveauSkill);
  form: FormGroup;
  submitting = false;
  error: string | null = null;

  constructor() {
    const skill = this.data?.skill ?? null;
    this.form = this.fb.group({
      nomSkill: [skill?.nomSkill ?? '', [Validators.required, Validators.minLength(1)]],
      description: [skill?.description ?? '', [Validators.required]],
      niveau: [skill?.niveau ?? NiveauSkill.DEBUTANT, Validators.required],
    });
  }

  get nomSkill() {
    return this.form.get('nomSkill');
  }
  get description() {
    return this.form.get('description');
  }
  get niveau() {
    return this.form.get('niveau');
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    this.error = null;
    const value = this.form.value as Pick<Skill, 'nomSkill' | 'description' | 'niveau'>;
    const skillPayload: Skill = {
      ...value,
      idSkill: this.data?.skill?.idSkill,
    };

    const request = this.isEdit
      ? this.skillService.updateSkill(skillPayload)
      : this.skillService.createSkill(skillPayload);

    request.subscribe({
      next: (saved: Skill) => {
        this.dialogRef.close(saved);
      },
      error: (err: any) => {
        console.error(err);
        this.error = this.isEdit ? 'competence.saveError' : 'competence.createError';
        this.submitting = false;
      },
    });
  }
}
