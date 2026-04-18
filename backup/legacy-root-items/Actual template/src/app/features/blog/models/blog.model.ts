export interface Article {
  id?: number;
  title: string;
  content: string;
  summary?: string;
  author: string;
  category: string;
  tags?: string;
  status?: string;
  reportCount: number;
  likeCount: number;
  dislikeCount: number;
  badge?: string;
  badgeColor?: string;
}

export interface ArticleReport {
  id?: number;
  articleId: number;
  reason: string;
  description?: string;
  reporterName?: string;
  email?: string;
  reportedAt?: string;
  status?: string;
}

export type ReactionType = 'LIKE' | 'DISLIKE';

export interface ReactionResponse {
  action: 'added' | 'removed' | 'changed';
  currentUserReaction: ReactionType | null;
  likeCount: number;
  dislikeCount: number;
  badge?: string;
  badgeColor?: string;
}

export interface UserReactionStatus {
  hasReacted: boolean;
  reactionType: ReactionType | null;
  likeCount: number;
  dislikeCount: number;
  badge?: string;
  badgeColor?: string;
}
