import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadWord } from '../models/bad-word.model';
import { BadWordService } from '../services/bad-word.service';

@Component({
  selector: 'app-bad-word-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bad-word-manager.component.html',
  styleUrl: './bad-word-manager.component.css'
})
export class BadWordManagerComponent implements OnInit {
  badWords: BadWord[] = [];
  newWord = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private badWordService: BadWordService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.badWordService.getAll().subscribe({
      next: (words: BadWord[]) => { this.badWords = words; this.loading = false; },
      error: () => this.loading = false
    });
  }

  add(): void {
    const word = this.newWord.trim().toLowerCase();
    if (!word) return;
    if (this.badWords.some((w: BadWord) => w.word === word)) {
      this.errorMessage = 'Ce mot existe déjà.';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    this.badWordService.create({ word }).subscribe({
      next: (bwResult: BadWord) => {
        this.badWords.push(bwResult);
        this.newWord = '';
        this.showSuccess('Mot ajouté avec succès !');
      }
    });
  }

  delete(bw: BadWord): void {
    if (!bw.id || !confirm(`Supprimer "${bw.word}" ?`)) return;
    this.badWordService.delete(bw.id).subscribe({
      next: () => {
        this.badWords = this.badWords.filter((w: BadWord) => w.id !== bw.id);
        this.showSuccess('Mot supprimé.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
