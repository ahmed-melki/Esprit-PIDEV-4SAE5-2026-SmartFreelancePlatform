import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageHeaderComponent } from '@shared';
import { MockDataService } from '@core/services/mock-data.service';
import { ConversationService } from '../../services/conversation.service';
import { Conversation } from '../../models/conversation.model';
import { NewConversationDialogComponent, NewConversationData } from '../../components/new-conversation-dialog/new-conversation-dialog.component';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
  ],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss']
})
export class ConversationListComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedId: number | null = null;
  /** Filtre affiché: toutes ou non lues. */
  currentFilter: 'all' | 'unread' = 'all';
  /** Terme de recherche (pour réappliquer après changement de filtre). */
  private searchValue = '';
  private avatarFailedIds = new Set<number>();
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private pollingStoppedDueToError = false;

  constructor(
    private conversationService: ConversationService,
    private router: Router,
    private dialog: MatDialog,
    public mockDataService: MockDataService
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.pollingInterval = setInterval(() => this.loadConversations(), 30_000);
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  loadConversations(): void {
    if (this.pollingStoppedDueToError) return;
    this.conversationService.getAll().subscribe({
      next: (data) => {
        this.conversations = data;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Erreur chargement conversations', err);
        // TEMP: évite de bloquer l'UI si le backend renvoie 500.
        this.conversations = [];
        this.filteredConversations = [];

        // Stop le polling pour éviter un spam de requêtes en échec.
        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
        this.pollingStoppedDueToError = true;
      }
    });
  }

  onFilterChange(value: string): void {
    this.currentFilter = value === 'unread' ? 'unread' : 'all';
    this.applyFilters();
  }

  /** Applique filtre Toutes/Non lues puis la recherche texte. */
  applyFilters(): void {
    let list = this.currentFilter === 'unread'
      ? this.conversations.filter(c => (c.unreadCount ?? 0) > 0)
      : this.conversations;
    if (this.searchValue) {
      const q = this.searchValue;
      list = list.filter(
        conv =>
          this.mockDataService.getClientName(conv.clientId).toLowerCase().includes(q) ||
          this.mockDataService.getFreelanceName(conv.freelanceId).toLowerCase().includes(q) ||
          (conv.lastMessageContent ?? '').toLowerCase().includes(q)
      );
    }
    this.filteredConversations = list;
  }

  applyFilter(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters();
  }

  selectAndGo(conv: Conversation): void {
    this.selectedId = conv.id ?? null;
    this.router.navigate(['/communication/chat', conv.id]);
  }

  deleteConversation(id: number, event: Event): void {
    event.stopPropagation();
    this.conversationService.delete(id).subscribe(() => {
      this.conversations = this.conversations.filter(c => c.id !== id);
      this.filteredConversations = this.filteredConversations.filter(c => c.id !== id);
    });
  }

  setAvatarFailed(id: number): void {
    this.avatarFailedIds.add(id);
  }

  avatarFailed(id: number | undefined): boolean {
    return id != null && this.avatarFailedIds.has(id);
  }

  getInitials(conv: Conversation): string {
    const c = String(conv.clientId).charAt(0);
    const f = String(conv.freelanceId).charAt(0);
    return (c + f).toUpperCase() || '#';
  }

  /** Indique si le contenu du dernier message correspond à un fichier. */
  isFileMessage(content: string | undefined): boolean {
    return !!content && (content.startsWith('📎') || content.includes('Fichier joint'));
  }

  openNewConversationDialog(): void {
    const dialogRef = this.dialog.open(NewConversationDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result: NewConversationData | undefined) => {
      if (result) {
        const payload: Conversation = {
          ...result,
          status: 'ACTIVE'
        };
        this.conversationService.create(payload).subscribe({
          next: () => this.loadConversations(),
          error: (err) => console.error('Erreur création', err)
        });
      }
    });
  }
}