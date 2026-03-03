import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ReactionService } from "../reaction.service";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // IMPORTANT: Ajouter pour ngModel

@Component({
  selector: 'app-event-mood',
  standalone: true,
  imports: [CommonModule, FormsModule], // Ajouter FormsModule ici
  templateUrl: './event-mood.component.html',
  styleUrls: ['./event-mood.component.css']
})
export class EventMoodComponent implements OnInit {
  @Input() eventId!: number;
  @Input() canReset: boolean = true;
  
  stats: any = {};
  showMood: boolean = true;
  selectedVote: string | null = null;
  hasVoted: boolean = false;
  
  // Pour suivre si le formulaire a été soumis
  formSubmitted: boolean = false;

  constructor(
    private reactionService: ReactionService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.eventId) {
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.eventId = +id;
          console.log('Event ID récupéré depuis URL:', this.eventId);
          this.initializeMood();
        }
      });
    } else {
      this.initializeMood();
    }
  }

  initializeMood() {
    this.loadStats();
    setInterval(() => this.loadStats(), 5000);
  }

  // Méthode appelée lors du changement des radios
  react(type: string) {
    this.selectedVote = type;
    // Ne pas envoyer immédiatement, attendre la soumission du formulaire
    console.log('Option sélectionnée:', type);
  }

  // NOUVELLE MÉTHODE: Soumission du formulaire
  submitVote() {
    if (!this.selectedVote) {
      console.log('Aucune option sélectionnée');
      return;
    }

    if (this.hasVoted) {
      console.log('Vous avez déjà voté');
      return;
    }

    // Récupère la liste des événements déjà votés
    const votedEvents: number[] = JSON.parse(localStorage.getItem('votedEvents') || '[]');

    // Vérifie si l'utilisateur a déjà voté pour cet événement
    if (votedEvents.includes(this.eventId)) {
      alert("Vous avez déjà voté pour cet événement !");
      this.hasVoted = true;
      return;
    }

    // Envoie la réaction au backend
    this.reactionService.react(this.eventId, this.selectedVote)
      .subscribe({
        next: () => {
          // Ajoute l'événement à la liste des votés
          votedEvents.push(this.eventId);
          localStorage.setItem('votedEvents', JSON.stringify(votedEvents));
          
          // Marque comme voté
          this.hasVoted = true;
          this.formSubmitted = true;
          
          // Recharge les statistiques
          this.loadStats();
          
          console.log('Vote enregistré avec succès!');
        },
        error: (err) => {
          console.error('Erreur lors du vote:', err);
          alert('Une erreur est survenue lors du vote. Veuillez réessayer.');
        }
      });
  }

  loadStats() {
    if (!this.eventId) return;

    this.reactionService.getStats(this.eventId)
      .subscribe({
        next: (data) => {
          this.stats = data;
          console.log('Stats chargées:', data);
        },
        error: (err) => {
          console.log('Erreur loadStats:', err);
          // Données de test en cas d'erreur
          this.stats = { 
            VERY_INTERESTED: 3, 
            INTERESTED: 5, 
            MAYBE: 2, 
            NOT_INTERESTED: 1 
          };
        }
      });
  }

  // Calcule le total des votes
  getTotalVotes(): number {
    return Object.values(this.stats)
      .reduce((a: number, b: any) => a + (Number(b) || 0), 0);
  }

  // Calcule le pourcentage pour une catégorie
  getPercentage(value: number): number {
    const total = this.getTotalVotes();
    return total ? Math.round((value / total) * 100) : 0;
  }

  // Vérifie si une statistique doit être affichée
  shouldShowStat(key: string): boolean {
    // Toujours afficher s'il y a des votes ou si la valeur existe
    return this.getTotalVotes() > 0 || (this.stats[key] && this.stats[key] > 0);
  }

  // Réinitialise tous les votes
  resetVotes() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les votes ?')) {
      // Logique de réinitialisation
      this.stats = {};
      this.selectedVote = null;
      this.hasVoted = false;
      this.formSubmitted = false;
      
      // Optionnel: appeler le service pour réinitialiser côté backend
      console.log('Votes réinitialisés');
    }
  }

  // Méthode utilitaire pour réinitialiser le formulaire
  resetForm() {
    this.selectedVote = null;
    this.formSubmitted = false;
    // Ne pas réinitialiser hasVoted car l'utilisateur a déjà voté
  }
}