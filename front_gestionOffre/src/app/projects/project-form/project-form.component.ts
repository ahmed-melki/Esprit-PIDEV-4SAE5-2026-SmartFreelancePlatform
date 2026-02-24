import { Component, OnInit } from '@angular/core';
import { ProjectService, Project } from '../project.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardContent, MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatSuffix, MatError, MatHint, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
    selector: 'app-project-form',
    templateUrl: './project-form.component.html',
    styleUrls: ['./project-form.component.css'],
    standalone: true,
    imports: [MatCardContent, MatIcon, NgIf, FormsModule, MatCard, MatCardHeader, MatCardAvatar, MatCardTitle, MatCardSubtitle, MatFormField, MatLabel, MatInput, MatSuffix, MatError, MatHint, MatCardActions, MatButton, MatPrefix, MatSelect, MatOption]
})
export class ProjectFormComponent implements OnInit {
  project: Project = { 
    title: '', 
    description: '', 
    budget: 0, 
    deadline: '', 
    status: 'OPEN'  // Valeur par défaut
  };
  id: number | null = null;
  today: string = new Date().toISOString().split('T')[0];
  
  // Stepper properties
  currentStep: number = 1;
  step1Completed: boolean = false;
  step2Completed: boolean = false;
  step3Completed: boolean = false;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.loadProject();
      // En mode édition, on affiche tout directement
      this.currentStep = 1;
      this.step1Completed = true;
      this.step2Completed = true;
      this.step3Completed = true;
    } else {
      // En mode création, le statut est forcé à OPEN
      this.project.status = 'OPEN';
      this.step3Completed = true; // ← FORCER ICI
      this.checkStep3Completion();
    }
  }

  loadProject(): void {
    this.projectService.getById(this.id!).subscribe({
      next: (data) => {
        this.project = data;
        // Format date for input
        if (this.project.deadline) {
          this.project.deadline = new Date(this.project.deadline)
            .toISOString().split('T')[0];
        }
      },
      error: (err) => console.error('Error loading project:', err)
    });
  }

  // Step navigation
  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
      // Quand on arrive au step 3 en création, forcer step3Completed
      if (this.currentStep === 3 && !this.id) {
        this.step3Completed = true;
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Check completion for each step
  checkStep1Completion(): void {
    this.step1Completed = !!(this.project.title && 
                            this.project.title.length >= 3 && 
                            this.project.description && 
                            this.project.description.length >= 10);
  }

  checkStep2Completion(): void {
    this.step2Completed = !!(this.project.budget > 0 && this.project.deadline);
  }

  checkStep3Completion(): void {
    // En mode création, step3 est automatiquement validé (status = 'OPEN')
    if (!this.id) {
      this.step3Completed = true; 
    } else {
      this.step3Completed = !!this.project.status;
    }
    console.log('Step 3 completed:', this.step3Completed); // Pour déboguer
  }

  // ✅ NOUVELLE MÉTHODE POUR LE BOUTON
  isPublishDisabled(): boolean {
    if (this.id) {
      // Mode édition : besoin des 3 steps
      return !this.step1Completed || !this.step2Completed || !this.step3Completed;
    } else {
      // Mode création : besoin seulement des steps 1 et 2
      return !this.step1Completed || !this.step2Completed;
    }
  }
 
  openDatePicker(inputElement: any): void {
    try {
      const nativeInput = inputElement?.nativeElement || inputElement;
      if (nativeInput) {
        if (typeof nativeInput.showPicker === 'function') {
          nativeInput.showPicker();
        } else {
          nativeInput.focus();
          nativeInput.click();
        }
      }
    } catch (error) {
      console.error('Error opening date picker:', error);
    }
  }

  save(): void {
    // En création, forcer le statut à OPEN (sécurité)
    if (!this.id) {
      this.project.status = 'OPEN';
    }
    
    console.log('Saving project:', this.project);

    if (this.id) {
      this.projectService.update(this.id, this.project).subscribe({
        next: () => {
          console.log('Project updated successfully');
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          console.error('Error updating project:', err);
          alert('Error updating project');
        }
      });
    } else {
      this.projectService.create(this.project).subscribe({
        next: () => {
          console.log('Project created successfully');
          this.router.navigate(['/projects']);
        },
        error: (err) => {
          console.error('Error creating project:', err);
          alert('Error creating project');
        }
      });
    }
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      this.router.navigate(['/projects']);
    }
  }
}