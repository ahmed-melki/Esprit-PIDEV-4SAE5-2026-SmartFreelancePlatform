import { Component } from '@angular/core';
import { NgModel, FormsModule } from '@angular/forms';
import { Event, EventType } from '../models/event.model';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-create-event',
    templateUrl: './create-event.component.html',
    styleUrls: ['./create-event.component.css'],
    standalone: true,
    imports: [NgIf, FormsModule]
})
export class CreateComponent {

  event: Event = {
    title: '',
    description: '',
    category: '',
    type: EventType.HACKATHON,
    startDate: '',
    endDate: '',
    location: '',
    price: 0
  };

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result ?? null;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  noOnlySpaces(model: NgModel) {
    if (!model.value || !model.value.trim()) {
      model.control.setErrors({ required: true });
    } else {
      if (model.control.errors?.['required']) {
        delete model.control.errors['required'];
        if (Object.keys(model.control.errors).length === 0) {
          model.control.setErrors(null);
        }
      }
    }
  }

  saveEvent() {
    this.errorMessage = '';
    this.successMessage = '';

    // Step 1: Handle Photo Upload (Unified on port 8081)
    if (this.selectedFile) {
      this.eventService.uploadImage(this.selectedFile).subscribe({
        next: (response: string) => {
          console.log('Upload response:', response);
          // Fallback if backend doesn't return URL
          this.executeCreation(this.selectedFile?.name || 'event_image.jpg');
        },
        error: (err: any) => this.handleError(err)
      });
    } else {
      this.executeCreation(null);
    }
  }

  private executeCreation(photoUrl: string | null) {
    const payload: Event = { ...this.event };

    // Set photo URL or professional placeholder
    payload.photoUrl = photoUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';

    // Format Dates for Spring Boot LocalDateTime sync
    if (payload.startDate && payload.startDate.length === 16) {
      payload.startDate += ':00';
    }
    if (payload.endDate && payload.endDate.length === 16) {
      payload.endDate += ':00';
    }

    // Ensure price is numeric for BigDecimal
    payload.price = Number(payload.price);

    // Step 2: Final JSON Creation
    this.eventService.create(payload).subscribe({
      next: () => {
        this.successMessage = "🎉 L'événement a été créé avec succès !";
        this.resetForm();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (err: any) => this.handleError(err)
    });
  }

  private handleError(err: any) {
    console.error('Process error:', err);
    const status = err.status || 'Unknown';
    const message = err.error?.message || err.statusText || 'No message';
    this.errorMessage = `Error ${status}: ${message}. Check that port 8081 is running.`;
  }

  private resetForm() {
    this.event = {
      title: '',
      description: '',
      category: '',
      type: EventType.HACKATHON,
      startDate: '',
      endDate: '',
      location: '',
      price: 0
    };
    this.previewUrl = null;
    this.selectedFile = null;
  }
}
