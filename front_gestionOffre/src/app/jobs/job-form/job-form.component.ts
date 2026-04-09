// src/app/components/job-form/job-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { JobOfferService, JobOffer, ContractType, JobStatus } from '../../jobs/job-offer.service';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css']
})
export class JobFormComponent implements OnInit {
  job: JobOffer = {
    title: '',
    description: '',
    company: '',
    location: '',
    contractType: ContractType.CDI,
    salaryMin: 0,
    salaryMax: 0,
    requiredSkills: [],
    experienceLevel: '',
    educationLevel: '',
    deadline: '',
    numberOfPositions: 1,
    status: JobStatus.OPEN,
    remotePossible: false,
    benefits: ''
  };
  
  id: number | null = null;
  loading = false;
  newSkill = '';
  skillsInput: string = '';
  contractTypes = Object.values(ContractType);
  jobStatuses = Object.values(JobStatus);
  experienceLevels = ['Junior', 'Intermediate', 'Senior', 'Expert'];
  educationLevels = ['Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Bac+8'];
  today = new Date().toISOString().split('T')[0];

  constructor(
    private jobService: JobOfferService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.loadJob();
    }
  }

  loadJob(): void {
    this.loading = true;
    this.jobService.getById(this.id!).subscribe({
      next: (data) => {
        this.job = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.showError('Impossible de charger l\'offre');
        this.loading = false;
      }
    });
  }

  

  save(): void {
    this.loading = true;
    
    if (this.id) {
      this.jobService.update(this.id, this.job).subscribe({
        next: () => {
          this.showSuccess('Offre mise à jour avec succès');
          this.router.navigate(['/jobs']);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.showError('Erreur lors de la mise à jour');
          this.loading = false;
        }
      });
    } else {
      this.jobService.create(this.job).subscribe({
        next: () => {
          this.showSuccess('Offre créée avec succès');
          this.router.navigate(['/jobs']);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.showError('Erreur lors de la création');
          this.loading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/jobs']);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
getStatusLabel(status: string): string {
  switch(status) {
    case 'OPEN': return 'Ouvert';
    case 'CLOSED': return 'Fermé';
    case 'DRAFT': return 'Brouillon';
    default: return status;
  }
}
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

addSkill(): void {
  console.log('=== addSkill ===');
  console.log('newSkill avant traitement:', this.newSkill);
  
  if (this.newSkill && this.newSkill.trim()) {
    const skillToAdd = this.newSkill.trim();
    console.log('skillToAdd:', skillToAdd);
    
    if (!this.job.requiredSkills.includes(skillToAdd)) {
      this.job.requiredSkills.push(skillToAdd);
      console.log('Compétences après ajout:', this.job.requiredSkills);
    } else {
      console.log('Compétence déjà présente!');
    }
    
    this.newSkill = '';
    console.log('newSkill après reset:', this.newSkill);
  } else {
    console.log('newSkill est vide ou null');
  }
}
onSkillInput(event: any): void {
  const value = event.target.value;
  if (value.endsWith(',')) {
    const skill = value.slice(0, -1).trim();
    if (skill && !this.job.requiredSkills.includes(skill)) {
      this.job.requiredSkills.push(skill);
    }
    this.skillsInput = '';
  }
}
 // ✅ Méthode pour parser les compétences depuis une chaîne
  parseSkills(): void {
    if (this.skillsInput && this.skillsInput.trim()) {
      // Séparer par virgule et nettoyer chaque compétence
      const skills = this.skillsInput
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      // Ajouter les nouvelles compétences (sans doublons)
      skills.forEach(skill => {
        if (!this.job.requiredSkills.includes(skill)) {
          this.job.requiredSkills.push(skill);
        }
      });
      
      // Réinitialiser l'input
      this.skillsInput = '';
    }
  }
// ✅ Méthode removeSkill
removeSkill(skill: string): void {
  this.job.requiredSkills = this.job.requiredSkills.filter((s: string) => s !== skill);
  console.log('Compétence supprimée, reste:', this.job.requiredSkills);
}
}