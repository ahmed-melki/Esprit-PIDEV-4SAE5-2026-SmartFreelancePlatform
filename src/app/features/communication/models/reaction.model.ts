export interface Reaction {
  id?: number;
  messageId: number;
  userId: number;
  emoji: string;
}

/** Pour l'affichage groupé (emoji + count) sous un message. */
export interface ReactionGroup {
  emoji: string;
  count: number;
}
