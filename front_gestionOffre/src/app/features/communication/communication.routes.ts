import { Routes } from '@angular/router';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ChatComponent } from './chat/chat.component';
import { FaqManagerComponent } from './faq-manager/faq-manager.component';
import { BadWordManagerComponent } from './bad-word-manager/bad-word-manager.component';

export const routes: Routes = [
  { path: '', redirectTo: 'conversations', pathMatch: 'full' },
  { path: 'conversations', component: ConversationListComponent },
  { path: 'chat/:id', component: ChatComponent },
  { path: 'faq', component: FaqManagerComponent },
  { path: 'bad-words', component: BadWordManagerComponent },
  { path: '**', redirectTo: 'conversations' }
];