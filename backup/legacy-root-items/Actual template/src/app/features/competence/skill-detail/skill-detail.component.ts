import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SkillService } from '../services/skill.service';
import { RatingService } from '../services/rating.service';
import { Skill, Rating, StatistiqueCompetenceDto } from '../models/competence.model';

@Component({
  selector: 'app-skill-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './skill-detail.component.html',
  styles: `
    .detail-container {
      min-height: 100vh;
      background: #fdfdfd;
    }

    .top-nav {
      padding: 1.5rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: #64748b;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s;
    }

    .back-link:hover { color: #1e293b; }

    .skill-hero {
      background: #1e293b;
      color: white;
      padding: 4rem 2rem;
      margin-bottom: 3rem;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .level-indicator {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .level-indicator.debutant { color: #34d399; }
    .level-indicator.intermediaire { color: #fbbf24; }
    .level-indicator.expert { color: #f87171; }

    .hero-content h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
    }

    .description {
      font-size: 1.25rem;
      line-height: 1.6;
      color: #cbd5e1;
      max-width: 800px;
    }

    .hero-stats {
      display: flex;
      gap: 2rem;
      margin-top: 3rem;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

    .stat-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 1.5rem 2.5rem;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-val { font-size: 2.5rem; font-weight: 800; color: #6366f1; }
    .stat-lbl { font-size: 0.8rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }

    .main-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem 5rem;
    }

    .reviews-section h2 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-bottom: 2rem;
      color: #0f172a;
    }

    .review-item {
      background: white;
      border: 1px solid #f1f5f9;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .star {
      color: #e2e8f0;
      font-size: 1.2rem;
    }

    .star.filled { color: #fbbf24; }

    .review-date { font-size: 0.8rem; color: #94a3b8; }
    .review-comment { color: #334155; line-height: 1.6; }

    .rating-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1.5rem;
      padding: 2.5rem;
      position: sticky;
      top: 2rem;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04);
    }

    .rating-card h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; }
    .rating-card p { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }

    .star-picker {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .star-picker button {
      background: none;
      border: none;
      font-size: 2rem;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.1s;
    }

    .star-picker button.active,
    .star-picker button.hover { color: #fbbf24; }

    textarea {
      width: 100%;
      height: 120px;
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
      resize: none;
      font-family: inherit;
    }

    textarea:focus {
      outline: none;
      border-color: #6366f1;
    }

    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .submit-btn:hover:not(:disabled) { background: #4f46e5; }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .full-loader {
      position: fixed;
      inset: 0;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 100;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid #f1f5f9;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 900px) {
      .main-layout { grid-template-columns: 1fr; }
      .rating-sidebar { order: -1; }
    }
  `
})
export class SkillDetailComponent implements OnInit {
  skill?: Skill;
  ratings: Rating[] = [];
  stats?: StatistiqueCompetenceDto;
  isLoading = true;
  isSubmitting = false;

  newRating: Rating = {
    note: 0,
    commentaire: ''
  };
  hoverNote = 0;

  constructor(
    private route: ActivatedRoute,
    private skillService: SkillService,
    private ratingService: RatingService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadData(+id);
    }
  }

  loadData(id: number): void {
    this.skillService.getById(id).subscribe(s => {
      this.skill = s;
      this.loadRatings(id);
      this.loadStats(id);
      this.isLoading = false;
    });
  }

  loadRatings(id: number): void {
    this.ratingService.getBySkill(id).subscribe(r => this.ratings = r);
  }

  loadStats(id: number): void {
    this.skillService.getSkillStats(id).subscribe(st => this.stats = st);
  }

  setNote(note: number): void {
    this.newRating.note = note;
  }

  submitRating(): void {
    if (!this.skill?.idSkill || this.newRating.note === 0) return;

    this.isSubmitting = true;
    this.ratingService.addRating(this.newRating, this.skill.idSkill).subscribe({
      next: () => {
        this.loadRatings(this.skill!.idSkill!);
        this.loadStats(this.skill!.idSkill!);
        this.newRating = { note: 0, commentaire: '' };
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error adding rating', err);
        this.isSubmitting = false;
      }
    });
  }
}
