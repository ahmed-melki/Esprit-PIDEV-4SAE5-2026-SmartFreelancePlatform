export interface ArticleReport {
  id?: number;
  articleId?: number;
  reason: string;
  description?: string;
  reporterName?: string;
  email?: string;
  reportedAt?: Date;
  createdAt?: Date;
  status?: string;
}