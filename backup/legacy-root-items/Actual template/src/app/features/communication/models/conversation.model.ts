export type ConversationStatus = 'ACTIVE' | 'CLOSED' | 'PENDING';

export interface Conversation {
  id?: number;
  clientId: number;
  freelanceId: number;
  projectId?: number;
  status?: ConversationStatus;
  urgentCount?: number;
  lastMessageContent?: string;
  lastMessageTime?: string;
  lastMessageSenderId?: number;
  theme?: string;
}
