import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { JobOffer } from '../../../core/models/job.model';

@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-job.component.html',
  styleUrl: './post-job.component.css'
})
export class PostJobComponent {
  jobForm: FormGroup;
  isSubmitting = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private router: Router
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      contractType: ['CDI', Validators.required],
      salaryMin: ['', Validators.min(0)],
      salaryMax: ['', Validators.min(0)],
      experienceLevel: [''],
      numberOfPositions: [1, [Validators.required, Validators.min(1)]],
      deadline: ['', Validators.required],
      requiredSkills: [''],
      remotePossible: [false],
      benefits: ['']
    });
  }

  onSubmit() {
    if (this.jobForm.invalid) return;

    this.isSubmitting = true;
    this.submitError = '';
    const v = this.jobForm.value;

    const newJob: JobOffer = {
      title: v.title,
      description: v.description,
      company: v.company,
      location: v.location,
      contractType: v.contractType,
      salaryMin: v.salaryMin || undefined,
      salaryMax: v.salaryMax || undefined,
      experienceLevel: v.experienceLevel,
      numberOfPositions: v.numberOfPositions,
      deadline: v.deadline,
      requiredSkills: v.requiredSkills
        ? v.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      remotePossible: v.remotePossible,
      benefits: v.benefits,
      employerId: 1 // Static for now
    };

    this.jobService.create(newJob).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        // Redirect to quiz creation for this job
        this.router.navigate(['/client/post-quiz', created.id]);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.submitError = 'Failed to post job. Ensure backend is running on port 8052.';
      }
    });
  }
}
