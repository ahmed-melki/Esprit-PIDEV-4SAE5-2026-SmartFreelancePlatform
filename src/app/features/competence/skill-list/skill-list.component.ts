import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SkillService } from '../services/skill.service';
import { Skill, NiveauSkill, StatistiqueCompetenceDto } from '../models/competence.model';

@Component({
  selector: 'app-skill-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './skill-list.component.html',
  styles: `
    .competence-container {
      padding: 3rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
      background: #fcfcfd;
      min-height: 100vh;
    }

    .header-section {
      text-align: center;
      margin-bottom: 3.5rem;
    }

    .header-section h1 {
      font-size: 3rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin-bottom: 1rem;
    }

    .header-section p {
      color: #64748b;
      font-size: 1.1rem;
    }

    .control-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 300px;
      position: relative;
    }

    .search-box span {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
    }

    .search-box input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .search-box input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }

    .filter-group {
      display: flex;
      gap: 0.5rem;
    }

    .filter-btn {
      padding: 0.625rem 1.25rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: #f8fafc;
    }

    .filter-btn.active {
      background: #1e293b;
      color: white;
      border-color: #1e293b;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2rem;
    }

    .skill-card {
      background: white;
      border-radius: 1.25rem;
      padding: 2rem;
      border: 1px solid #f1f5f9;
      transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
      cursor: pointer;
      display: flex;
      flex-direction: column;
    }

    .skill-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
    }

    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .level-badge {
      padding: 0.4rem 0.8rem;
      border-radius: 0.5rem;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .level-badge.debutant { background: #ecfdf5; color: #059669; }
    .level-badge.intermediaire { background: #fffbeb; color: #d97706; }
    .level-badge.expert { background: #fef2f2; color: #dc2626; }

    .skill-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-weight: 700;
      color: #fbbf24;
    }

    .skill-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 0.75rem;
    }

    .skill-desc {
      color: #64748b;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      flex-grow: 1;
    }

    .skill-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.25rem;
      border-top: 1px solid #f8fafc;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .id-tag {
      font-family: monospace;
      background: #f1f5f9;
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
    }

    .loader {
      display: flex;
      justify-content: center;
      padding: 5rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f1f5f9;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 5rem;
      color: #94a3b8;
    }

    .empty-state span {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  `
})
export class SkillListComponent implements OnInit {
  skills: Skill[] = [];
  allSkills: Skill[] = [];
  skillStats: { [id: number]: StatistiqueCompetenceDto } = {};
  isLoading = true;
  searchTerm = '';
  selectedNiveau = 'All';
  niveauOptions = ['All', 'DEBUTANT', 'INTERMEDIAIRE', 'EXPERT'];

  constructor(private skillService: SkillService) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills(): void {
    this.skillService.getAll().subscribe({
      next: (data) => {
        this.allSkills = data;
        this.skills = data;
        this.loadAllStats();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading skills', err);
        this.isLoading = false;
      }
    });
  }

  loadAllStats(): void {
    this.allSkills.forEach(skill => {
      if (skill.idSkill) {
        this.skillService.getSkillStats(skill.idSkill).subscribe(stats => {
          this.skillStats[skill.idSkill!] = stats;
        });
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  filterByNiveau(niveau: string): void {
    this.selectedNiveau = niveau;
    this.applyFilters();
  }

  applyFilters(): void {
    this.skills = this.allSkills.filter(s => {
      const matchesSearch = s.nomSkill.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesNiveau = this.selectedNiveau === 'All' || s.niveau === this.selectedNiveau;
      return matchesSearch && matchesNiveau;
    });
  }
}
