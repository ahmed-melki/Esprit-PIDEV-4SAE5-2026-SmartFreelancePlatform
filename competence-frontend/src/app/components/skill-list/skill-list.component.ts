import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SkillService } from '../../services/skill.service';
import { Skill } from '../../models/skill.model';
import { SkillFormDialogComponent } from '../skill-form-dialog/skill-form-dialog.component';
import { RatingsDialogComponent } from '../ratings-dialog/ratings-dialog.component';

@Component({
  selector: 'app-skill-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  templateUrl: './skill-list.component.html',
  styleUrls: ['./skill-list.component.css'],
})
export class SkillListComponent implements OnInit {
  private readonly skillService = inject(SkillService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);

  competence: Skill[] = [];
  dataSource = new MatTableDataSource<Skill>([]);
  displayedColumns: string[] = ['nomSkill', 'description', 'niveau', 'actions'];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadcompetence();
  }

  loadcompetence(): void {
    this.loading = true;
    this.error = null;
    this.skillService.getAllSkills().subscribe({
      next: (data: Skill[]) => {
        this.competence = data ?? [];
        this.dataSource.data = this.competence;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur:', err);
        this.error = 'competence.error';
        this.loading = false;
      },
    });
  }

  /** Ouvre le dialogue d'ajout (sans skill) ou d'édition (avec skill). */
  openSkillForm(skill?: Skill): void {
    const ref = this.dialog.open(SkillFormDialogComponent, {
      width: '420px',
      data: { skill: skill ?? null },
    });
    ref.afterClosed().subscribe(result => {
      if (result != null) this.loadcompetence();
    });
  }

  /** Ouvre le dialogue des notes pour la compétence (bouton "Voir détails" / étoile). */
  viewRatings(skill: Skill): void {
    this.dialog.open(RatingsDialogComponent, {
      width: '560px',
      data: { skill },
    });
  }

  deleteSkill(skill: Skill): void {
    const id = skill.idSkill;
    if (id == null) return;
    this.translate.get('competence.confirmDelete').subscribe(msg => {
      if (!confirm(msg)) return;
      this.skillService.deleteSkill(id).subscribe({
        next: () => {
          this.competence = this.competence.filter(s => s.idSkill !== id);
          this.dataSource.data = this.competence;
          this.translate.get('competence.deleted').subscribe((m: string) => alert(m));
        },
        error: (err: any) => {
          console.error('Erreur suppression:', err);
          this.translate.get('competence.deleteError').subscribe((m: string) => alert(m));
        },
      });
    });
  }
}
