import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-post-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-project.component.html',
  styleUrl: './post-project.component.css'
})
export class PostProjectComponent {
  projectForm: FormGroup;
  isSubmitting = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      budget: ['', [Validators.required, Validators.min(1)]],
      deadline: ['', Validators.required],
      skills: [''] // We will append this to description
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) return;

    this.isSubmitting = true;
    this.submitError = '';
    const formVal = this.projectForm.value;
    
    // Append skills to description so the backend AI matching can find it
    const finalDescription = formVal.skills 
      ? `${formVal.description}\n\nRequired Skills: ${formVal.skills}` 
      : formVal.description;

    const newProject: Project = {
      title: formVal.title,
      description: finalDescription,
      budget: formVal.budget,
      deadline: formVal.deadline, // e.g. "2026-12-31" from date input
      client: { id: 1 } // Hardcoded client ID for now
    };

    this.projectService.addProject(newProject).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/client/dashboard']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.submitError = 'Failed to post project. Ensure backend runs on port 8045.';
      }
    });
  }
}
