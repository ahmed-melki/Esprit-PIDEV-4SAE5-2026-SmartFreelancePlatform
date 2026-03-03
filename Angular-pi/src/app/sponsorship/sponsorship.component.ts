import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

export interface SponsorshipCreateDTO {
  eventId: number;
  sponsorFirstName: string;
  sponsorLastName: string;
  sponsorEmail: string;
  amount: number;
  contractStatus?: string;
  pdfUrl?: string;
}

@Component({
  selector: 'app-sponsorship',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sponsorship.component.html',
  styleUrls: ['./sponsorship.component.css']
})
export class SponsorshipComponent implements OnInit {
  // Propriétés existantes
  sponsorship: SponsorshipCreateDTO = {
    eventId: 0,
    sponsorFirstName: '',
    sponsorLastName: '',
    sponsorEmail: '',
    amount: 0
  };

  pdfUrl: SafeResourceUrl | null = null;
  sponsorshipId: number | null = null;
  
  // NOUVELLES PROPRIÉTÉS À AJOUTER
  isSubmitting: boolean = false;
  isSigning: boolean = false;
  termsAccepted: boolean = false;
  isContractSigned: boolean = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const eventId = Number(params['id'] || params['eventId']);
      if (eventId > 0) {
        this.sponsorship.eventId = eventId;
        console.log('Event ID récupéré:', eventId);
      } else {
        console.warn('Event ID non défini ou invalide');
      }
    });
  }

  submitSponsorship() {
    console.log('Données à envoyer:', this.sponsorship);

    // Validation simple
    if (!this.sponsorship.eventId ||
        !this.sponsorship.sponsorFirstName.trim() ||
        !this.sponsorship.sponsorLastName.trim() ||
        !this.sponsorship.sponsorEmail.trim() ||
        this.sponsorship.amount <= 0) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (this.sponsorship.amount < 100) {
      alert('Le montant minimum est de 100 €.');
      return;
    }

    // Désactiver le bouton pendant la soumission
    this.isSubmitting = true;

    // POST vers le backend
    this.http.post<any>('http://localhost:8081/pi/api/sponsorships', this.sponsorship)
      .subscribe({
        next: (res) => {
          this.sponsorshipId = res.id;
          if (this.sponsorshipId != null) {
            this.getPDF(this.sponsorshipId);
          }
          alert('Sponsoring créé avec succès !');
          this.isSubmitting = false; // Réactiver le bouton
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la création du sponsoring.');
          this.isSubmitting = false; // Réactiver le bouton même en cas d'erreur
        }
      });
  }

  getPDF(id: number) {
    const pdfEndpoint = `http://localhost:8081/pi/api/sponsorships/${id}/pdf`;
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfEndpoint);
  }

  signContract() {
    if (!this.sponsorshipId) return;

    // Désactiver le bouton pendant la signature
    this.isSigning = true;

    const signEndpoint = `http://localhost:8081/pi/api/sponsorships/${this.sponsorshipId}/sign`;
    this.http.post(signEndpoint, {}).subscribe({
      next: () => {
        alert('Contrat signé avec succès !');
        this.isContractSigned = true; // Marquer comme signé
        this.isSigning = false; // Réactiver le bouton
      },
      error: (err) => {
        console.error('Erreur signature contrat:', err);
        alert('Erreur lors de la signature du contrat.');
        this.isSigning = false; // Réactiver le bouton même en cas d'erreur
      }
    });
  }

  // NOUVELLES MÉTHODES POUR LE HTML AMÉLIORÉ
  resetForm(): void {
    this.sponsorship = {
      eventId: this.sponsorship.eventId, // Garder l'eventId
      sponsorFirstName: '',
      sponsorLastName: '',
      sponsorEmail: '',
      amount: 0
    };
    this.pdfUrl = null;
    this.sponsorshipId = null;
    this.isContractSigned = false;
    this.termsAccepted = false;
  }

  downloadPDF(): void {
    if (this.sponsorshipId) {
      window.open(`http://localhost:8081/pi/api/sponsorships/${this.sponsorshipId}/pdf`, '_blank');
    }
  }

  printPDF(): void {
    if (this.sponsorshipId) {
      const printWindow = window.open(`http://localhost:8081/pi/api/sponsorships/${this.sponsorshipId}/pdf`, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  }

  showTerms(event: MouseEvent): void {
    event.preventDefault();
    alert('Termes et conditions du contrat de sponsoring:\n\n' +
          '1. Le sponsor s\'engage à verser le montant convenu\n' +
          '2. L\'événement s\'engage à mentionner le sponsor\n' +
          '3. Le contrat est valable pour la durée de l\'événement\n' +
          '4. Aucun remboursement après signature\n' +
          '5. Conformité avec les lois en vigueur');
  }

  downloadSignedPDF(): void {
    if (this.sponsorshipId) {
      // Vous pouvez rediriger vers le PDF ou le télécharger
      window.open(`http://localhost:8081/pi/api/sponsorships/${this.sponsorshipId}/pdf`, '_blank');
    }
  }

  // Méthode pour naviguer vers la liste des événements
  goBackToEvents(): void {
    this.router.navigate(['/events']);
  }
}