import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CandidatureService } from '../../../core/services/candidature.service';
import { JobService } from '../../../core/services/job.service';
import { FileService } from '../../../core/services/file.service';
import { JobOffer } from '../../../core/models/job.model';

const MOCK_FREELANCER_ID = 1;

@Component({
  selector: 'app-apply-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './apply-job.component.html',
  styleUrl: './apply-job.component.css'
})
export class ApplyJobComponent implements OnInit {
  jobId!: number;
  job: JobOffer | null = null;
  applyForm: FormGroup;
  isSubmitting = false;
  submitError = '';
  success = false;

  // CV file upload state
  selectedFile: File | null = null;
  fileName = '';
  isUploading = false;
  uploadProgress = '';
  cvUrl = ''; // URL returned by backend after upload

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private candidatureService: CandidatureService,
    private jobService: JobService,
    private fileService: FileService
  ) {
    this.applyForm = this.fb.group({
      lettreMotivation: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.jobService.getById(this.jobId).subscribe({
      next: (job) => this.job = job,
      error: (err) => console.error('Could not load job', err)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      this.submitError = 'Please upload a PDF or Word document.';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.submitError = 'File size must be less than 10MB.';
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    this.submitError = '';
    this.cvUrl = ''; // Reset if re-selecting
    this.uploadCV();
  }

  uploadCV() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 'Uploading...';

    this.fileService.uploadCV(this.selectedFile).subscribe({
      next: (url) => {
        this.cvUrl = url;
        this.isUploading = false;
        this.uploadProgress = 'Uploaded ✓';
      },
      error: (err) => {
        console.error(err);
        this.isUploading = false;
        this.uploadProgress = '';
        this.submitError = 'CV upload failed. Make sure the backend is running on port 8052.';
      }
    });
  }

  onSubmit() {
    if (this.applyForm.invalid || !this.cvUrl) return;

    this.isSubmitting = true;
    this.submitError = '';
    const { lettreMotivation } = this.applyForm.value;

    this.candidatureService.postuler(this.jobId, MOCK_FREELANCER_ID, lettreMotivation, this.cvUrl).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error || 'Application failed. You may have already applied, or the quiz was not passed.';
      }
    });
  }
}
