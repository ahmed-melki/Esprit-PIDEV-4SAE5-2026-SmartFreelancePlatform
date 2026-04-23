import { Routes } from '@angular/router';
import { ConversationListComponent } from './pages/conversation-list/conversation-list.component';
import { ChatComponent } from './pages/chat/chat.component';

export const routes: Routes = [
  { path: '', redirectTo: 'conversations', pathMatch: 'full' },
  { path: 'conversations', component: ConversationListComponent },
  { path: 'chat/:id', component: ChatComponent },
  { path: '**', redirectTo: 'conversations' },
];
