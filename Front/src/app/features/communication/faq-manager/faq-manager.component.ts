import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Faq } from '../models/faq.model';
import { FaqService } from '../services/faq.service';

@Component({
  selector: 'app-faq-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq-manager.component.html',
  styleUrl: './faq-manager.component.css'
})
export class FaqManagerComponent implements OnInit {
  faqs: Faq[] = [];
  editingFaq: Faq | null = null;
  newFaq: Faq = { keyword: '', answer: '' };
  showCreateForm = false;
  searchTerm = '';
  loading = false;
  successMessage = '';

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.loading = true;
    this.faqService.getAll().subscribe({
      next: (faqs: Faq[]) => { this.faqs = faqs; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get filteredFaqs(): Faq[] {
    if (!this.searchTerm) return this.faqs;
    const t = this.searchTerm.toLowerCase();
    return this.faqs.filter((f: Faq) =>
      f.keyword.toLowerCase().includes(t) || f.answer.toLowerCase().includes(t)
    );
  }

  createFaq(): void {
    if (!this.newFaq.keyword.trim() || !this.newFaq.answer.trim()) return;
    this.faqService.create(this.newFaq).subscribe({
      next: (faq: Faq) => {
        this.faqs.push(faq);
        this.newFaq = { keyword: '', answer: '' };
        this.showCreateForm = false;
        this.showSuccess('FAQ créée avec succès !');
      }
    });
  }

  startEdit(faq: Faq): void {
    this.editingFaq = { ...faq };
  }

  saveEdit(): void {
    if (!this.editingFaq?.id) return;
    this.faqService.update(this.editingFaq.id, this.editingFaq).subscribe({
      next: (updated: Faq) => {
        const idx = this.faqs.findIndex((f: Faq) => f.id === updated.id);
        if (idx !== -1) this.faqs[idx] = updated;
        this.editingFaq = null;
        this.showSuccess('FAQ mise à jour !');
      }
    });
  }

  cancelEdit(): void {
    this.editingFaq = null;
  }

  deleteFaq(faq: Faq): void {
    if (!faq.id || !confirm('Supprimer cette FAQ ?')) return;
    this.faqService.delete(faq.id).subscribe({
      next: () => {
        this.faqs = this.faqs.filter((f: Faq) => f.id !== faq.id);
        this.showSuccess('FAQ supprimée.');
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
