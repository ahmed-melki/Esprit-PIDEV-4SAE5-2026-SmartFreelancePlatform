import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommunicationRoutingModule } from './communication-routing.module';
import { ConversationListComponent } from './pages/conversation-list/conversation-list.component';
import { ChatComponent } from './pages/chat/chat.component';
import { MessageInputComponent } from './components/message-input/message-input.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    CommunicationRoutingModule,
    ConversationListComponent,
    ChatComponent,
    MessageInputComponent
  ]
})
export class CommunicationModule { }