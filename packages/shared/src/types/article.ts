export type ArticleStatus = 'draft' | 'published';

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  status: ArticleStatus;
  categoryId: string | null;
  categoryName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
  seoTitle: string;
  seoDescription: string;
}

export interface CreateArticleRequest {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverUrl?: string;
  status?: ArticleStatus;
  categoryId?: string;
  tagIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  isTop?: boolean;
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {}
