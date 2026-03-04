import type {
  ArticleDetail,
  ArticleSummary,
  CreateArticleRequest,
  PaginationResult,
  UpdateArticleRequest,
} from '@narcissus/shared';

import { apiClient, unwrapResponse } from '@/services/api-client';

export interface ArticleQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 'draft' | 'published';
}

export const articlesService = {
  async getPublicList(query: ArticleQuery): Promise<PaginationResult<ArticleSummary>> {
    const response = await apiClient.get('/articles/public', { params: query });
    return unwrapResponse<PaginationResult<ArticleSummary>>(response);
  },
  async getPublicDetail(slug: string): Promise<ArticleDetail> {
    const response = await apiClient.get(`/articles/public/${slug}`);
    return unwrapResponse<ArticleDetail>(response);
  },
  async getAdminList(query: ArticleQuery): Promise<PaginationResult<ArticleSummary>> {
    const response = await apiClient.get('/articles', { params: query });
    return unwrapResponse<PaginationResult<ArticleSummary>>(response);
  },
  async getAdminDetail(id: string): Promise<ArticleDetail> {
    const response = await apiClient.get(`/articles/${id}`);
    return unwrapResponse<ArticleDetail>(response);
  },
  async create(payload: CreateArticleRequest): Promise<ArticleSummary> {
    const response = await apiClient.post('/articles', payload);
    return unwrapResponse<ArticleSummary>(response);
  },
  async update(id: string, payload: UpdateArticleRequest): Promise<ArticleDetail> {
    const response = await apiClient.patch(`/articles/${id}`, payload);
    return unwrapResponse<ArticleDetail>(response);
  },
  async remove(id: string): Promise<{ id: string }> {
    const response = await apiClient.delete(`/articles/${id}`);
    return unwrapResponse<{ id: string }>(response);
  },
};
