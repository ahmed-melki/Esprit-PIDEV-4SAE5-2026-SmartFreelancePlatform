// models/reaction.model.ts
export type ReactionType = 'LIKE' | 'DISLIKE';

export interface ToggleReactionResponse {
    likeCount: number;
    dislikeCount: number;
    currentUserReaction: ReactionType | null;
    badge: string | null;
    badgeColor: string | null;
    action: 'added' | 'removed' | 'changed';
}

export interface UserReactionResponse {
    hasReacted: boolean;
    reactionType: ReactionType | null;
    likeCount: number;
    dislikeCount: number;
    badge: string | null;
    badgeColor: string | null;
}

export interface ReactionStats {
    likeCount: number;
    dislikeCount: number;
    totalReactions: number;
    netScore: number;
}