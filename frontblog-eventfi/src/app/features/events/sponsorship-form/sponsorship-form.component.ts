import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SponsorshipService } from '../services/sponsorship.service';
import { SponsorshipDTO } from '../models/event.model';

@Component({
  selector: 'app-sponsorship-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sponsorship-form.component.html',
  styleUrl: './sponsorship-form.component.css'
})
export class SponsorshipFormComponent implements OnInit {
  eventId!: number;
  sponsorship: SponsorshipDTO = {
    eventId: 0,
    amount: 100,
    sponsorFirstName: '',
    sponsorLastName: '',
    sponsorEmail: ''
  };

  isSubmitting = false;
  successSponsorship?: SponsorshipDTO;

  constructor(
    private route: ActivatedRoute,
    private sponsorshipService: SponsorshipService
  ) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.sponsorship.eventId = this.eventId;
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.sponsorshipService.create(this.sponsorship).subscribe({
      next: (res) => {
        this.successSponsorship = res;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating sponsorship', err);
        this.isSubmitting = false;
        alert('Erreur lors de la création du sponsorship. Veuillez vérifier les données.');
      }
    });
  }

  downloadPDF(): void {
    if (!this.successSponsorship?.id) return;
    this.sponsorshipService.getPDF(this.successSponsorship.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrat_sponsorship_${this.successSponsorship?.id}.pdf`;
      a.click();
    });
  }

  signAndFinish(): void {
    if (!this.successSponsorship?.id) return;
    this.sponsorshipService.signContract(this.successSponsorship.id).subscribe(() => {
      alert('Contrat signé avec succès !');
      // Potential redirect to events list
    });
  }
}
