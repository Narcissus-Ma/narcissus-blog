import { describe, expect, it, vi } from 'vitest';

import { ArticlesService } from './articles.service';

function createMockPrismaService() {
  const article = {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  return {
    article,
    $transaction: vi.fn(async (items: Promise<unknown>[]) => Promise.all(items)),
  };
}

describe('ArticlesService', () => {
  it('listPublic 应透传分类与标签筛选条件', async () => {
    const prismaService = createMockPrismaService();
    prismaService.article.findMany.mockResolvedValue([
      {
        id: 'a1',
        title: '标题',
        slug: 'slug-1',
        excerpt: '摘要',
        coverUrl: '',
        status: 'published',
        createdAt: new Date('2026-03-18T00:00:00.000Z'),
        updatedAt: new Date('2026-03-18T00:00:00.000Z'),
        publishedAt: new Date('2026-03-18T00:00:00.000Z'),
        category: { id: 'c1', name: '前端', slug: 'frontend' },
        articleTag: [{ tag: { id: 't1', name: 'React', slug: 'react' } }],
      },
    ]);
    prismaService.article.count.mockResolvedValue(1);

    const service = new ArticlesService(prismaService as never);
    await service.listPublic({ categorySlug: 'frontend', tagSlug: 'react' });

    expect(prismaService.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { slug: 'frontend' },
          articleTag: { some: { tag: { slug: 'react' } } },
        }),
      }),
    );
    expect(prismaService.article.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { slug: 'frontend' },
          articleTag: { some: { tag: { slug: 'react' } } },
        }),
      }),
    );
  });

  it('getPublicBySlug 应返回上一篇与下一篇', async () => {
    const prismaService = createMockPrismaService();
    prismaService.article.findFirst
      .mockResolvedValueOnce({
        id: 'a2',
        title: '当前文章',
        slug: 'current-post',
        excerpt: '摘要',
        coverUrl: '',
        status: 'published',
        createdAt: new Date('2026-03-18T00:00:00.000Z'),
        updatedAt: new Date('2026-03-18T00:00:00.000Z'),
        publishedAt: new Date('2026-03-18T00:00:00.000Z'),
        seoTitle: 'SEO 标题',
        seoDescription: 'SEO 描述',
        content: '# 标题',
        category: { id: 'c1', name: '前端', slug: 'frontend' },
        articleTag: [{ tag: { id: 't1', name: 'React', slug: 'react' } }],
      })
      .mockResolvedValueOnce({ title: '上一篇文章', slug: 'prev-post' })
      .mockResolvedValueOnce({ title: '下一篇文章', slug: 'next-post' });

    const service = new ArticlesService(prismaService as never);
    const result = await service.getPublicBySlug('current-post');

    expect(result.prevPost).toEqual({ title: '上一篇文章', slug: 'prev-post' });
    expect(result.nextPost).toEqual({ title: '下一篇文章', slug: 'next-post' });
  });
});
