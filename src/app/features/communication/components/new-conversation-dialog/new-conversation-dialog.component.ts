import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Client, Freelance, MockDataService, Project } from '@core/services/mock-data.service';

/** Données renvoyées à la fermeture du dialogue (création). */
export interface NewConversationData {
  clientId: number;
  freelanceId: number;
  projectId: number;
}

@Component({
  selector: 'app-new-conversation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './new-conversation-dialog.component.html',
  styleUrls: ['./new-conversation-dialog.component.scss']
})
export class NewConversationDialogComponent implements OnInit {
  clients: Client[] = [];
  freelances: Freelance[] = [];
  projets: Project[] = [];

  filteredProjets: { id: number; name: string }[] = [];

  conversationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewConversationDialogComponent>,
    private mockDataService: MockDataService
  ) {
    this.clients = this.mockDataService.clients;
    this.freelances = this.mockDataService.freelances;
    this.projets = this.mockDataService.projets;

    this.conversationForm = this.fb.group({
      clientId: [null, [Validators.required, Validators.min(1)]],
      freelanceId: [null, [Validators.required, Validators.min(1)]],
      projectId: [null, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    // Filtrer les projets selon le freelance sélectionné
    this.conversationForm.get('freelanceId')?.valueChanges.subscribe(freelanceId => {
      if (freelanceId) {
        this.filteredProjets = this.projets
          .filter(p => p.freelanceId === freelanceId)
          .map(p => ({ id: p.id, name: p.name }));
        // Réinitialiser la sélection du projet si le freelance change
        this.conversationForm.get('projectId')?.setValue(null);
      } else {
        this.filteredProjets = [];
        this.conversationForm.get('projectId')?.setValue(null);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.conversationForm.valid) {
      this.dialogRef.close(this.conversationForm.value);
    }
  }
}
