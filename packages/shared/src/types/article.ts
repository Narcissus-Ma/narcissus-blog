export type ArticleStatus = 'draft' | 'published';

export interface ArticleTagSummary {
  id: string;
  name: string;
  slug: string;
}

export interface AdjacentPostSummary {
  title: string;
  slug: string;
}

export interface RandomArticleResult {
  title: string;
  slug: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  status: ArticleStatus;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string;
  tagItems: ArticleTagSummary[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
  seoTitle: string;
  seoDescription: string;
  prevPost?: AdjacentPostSummary | null;
  nextPost?: AdjacentPostSummary | null;
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
