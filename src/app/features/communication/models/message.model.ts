export interface Message {
  id?: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  /** Timestamp ISO indiquant quand le destinataire a lu le message (si applicable). */
  readAt?: string;
  createdAt?: string;
  /** URL du fichier joint (si message avec pièce jointe). */
  fileUrl?: string;
  /** Nom du fichier pour affichage et téléchargement. */
  fileName?: string;
  /** Taille du fichier joint en octets (optionnel). */
  fileSize?: number;
  /** Indique si le message a été supprimé (soft delete côté backend). */
  deleted?: boolean;

  /** True si supprimé pour langage inapproprié (modération). */
  inappropriate?: boolean;

  /** True si le message contient des mots-clés d'urgence. */
  urgent?: boolean;

  /** True si le message correspond à un partage de position. */
  location?: boolean;
  /** Latitude associée au partage de position. */
  locationLat?: number;
  /** Longitude associée au partage de position. */
  locationLng?: number;
}