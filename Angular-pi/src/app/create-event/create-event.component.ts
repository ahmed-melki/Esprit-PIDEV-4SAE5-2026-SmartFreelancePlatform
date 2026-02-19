import { Component } from '@angular/core';
import { NgModel } from '@angular/forms';
import { Event } from '../event.model';
import { EventService } from '../event.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateComponent {

  event: Event = {
    title: '',
    description: '',
    category: '',
    type: 'HACKATHON',
    startDate: '',
    endDate: '',
    location: '',
    price: 0
  };

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  // ⚡ Nouveau : message de confirmation
  successMessage: string = '';

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

  // ⚡ Validateur personnalisé pour empêcher les espaces
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
    this.eventService.create(this.event).subscribe({
      next: () => {
        // ⚡ Affiche le message de confirmation
        this.successMessage = "🎉 L'événement a été créé avec succès !";

        // ⚡ Réinitialiser le formulaire
        this.event = {
          title: '',
          description: '',
          category: '',
          type: 'HACKATHON',
          startDate: '',
          endDate: '',
          location: '',
          price: 0
        };
        this.previewUrl = null;

        // ⚡ Faire disparaître le message après 5 secondes
        setTimeout(() => this.successMessage = '', 5000);

        // ⚡ Si tu veux rediriger après 2 secondes au lieu du message, tu peux faire :
        // setTimeout(() => this.router.navigate(['/event']), 2000);
      },
      error: (err) => {
        console.error('Erreur création événement', err);
      }
    });
  }

  
}
