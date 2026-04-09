export interface Article {
  badge: any;
  badgeColor: any;
  netScore: number;
  dislikeCount: number;
  likeCount: number;
  currentUserReaction: string;
 
selectedReason?: string;
comment?: string;
  
  id: number;
  title: string;
  content: string;
  summary?: string;
  author?: string;
  category?: string;
  tags?: string;
  status?: string;
  likes?: number;
  
   reportCount?: number;
  createdAt?: Date;
  updatedAt?: Date;

  
}