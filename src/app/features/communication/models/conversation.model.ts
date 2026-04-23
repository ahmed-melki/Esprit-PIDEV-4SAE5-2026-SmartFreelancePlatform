export interface Conversation {
  id?: number;
  clientId: number;
  freelanceId: number;
  projectId: number;
  status: 'ACTIVE' | 'CLOSED' | 'PENDING';
  /** Nom de l'autre participant (affichage, peut venir du backend). */
  otherParticipantName?: string;
  /** Contenu du dernier message (backend). */
  lastMessageContent?: string;
  /** Date du dernier message, ISO string (backend). */
  lastMessageTime?: string;
  /** ID de l'expéditeur du dernier message (backend). */
  lastMessageSenderId?: number;
  /** Nombre de messages non lus (backend). */
  unreadCount?: number;
  /** Thème d'affichage du chat (backend). */
  theme?: string;

  /** Nombre de messages urgents non supprimés dans la conversation (backend). */
  urgentCount?: number;
}