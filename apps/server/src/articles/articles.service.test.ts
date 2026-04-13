import { NotFoundException } from '@nestjs/common';
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

  it('getRandomPublicArticle 应只从已发布文章中随机返回', async () => {
    const prismaService = createMockPrismaService();
    prismaService.article.count.mockResolvedValue(3);
    prismaService.article.findFirst.mockResolvedValue({
      slug: 'published-post',
      title: '已发布文章',
    });

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const service = new ArticlesService(prismaService as never);

    await expect(service.getRandomPublicArticle()).resolves.toEqual({
      slug: 'published-post',
      title: '已发布文章',
    });

    expect(prismaService.article.count).toHaveBeenCalledWith({
      where: { status: 'published' },
    });
    expect(prismaService.article.findFirst).toHaveBeenCalledWith({
      where: { status: 'published' },
      skip: 1,
      select: { slug: true, title: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    randomSpy.mockRestore();
  });

  it('getRandomPublicArticle 在没有已发布文章时应抛出异常', async () => {
    const prismaService = createMockPrismaService();
    prismaService.article.count.mockResolvedValue(0);

    const service = new ArticlesService(prismaService as never);

    await expect(service.getRandomPublicArticle()).rejects.toBeInstanceOf(NotFoundException);
    expect(prismaService.article.findFirst).not.toHaveBeenCalled();
  });

  it('searchPublic 在空关键词时应返回空列表而不是全站文章', async () => {
    const prismaService = createMockPrismaService();
    const service = new ArticlesService(prismaService as never);

    await expect(service.searchPublic({ keyword: '   ' })).resolves.toEqual({
      list: [],
      total: 0,
      page: 1,
      pageSize: 5,
    });

    expect(prismaService.article.findMany).not.toHaveBeenCalled();
    expect(prismaService.article.count).not.toHaveBeenCalled();
  });

  it('searchPublic 应忽略未发布文章并按发布时间倒序返回', async () => {
    const prismaService = createMockPrismaService();
    prismaService.article.findMany.mockResolvedValue([
      {
        id: 'a3',
        title: 'React 搜索',
        slug: 'react-search',
        excerpt: '摘要',
        coverUrl: '',
        status: 'published',
        createdAt: new Date('2026-03-20T00:00:00.000Z'),
        updatedAt: new Date('2026-03-20T00:00:00.000Z'),
        publishedAt: new Date('2026-03-20T00:00:00.000Z'),
        category: { id: 'c1', name: '前端', slug: 'frontend' },
        articleTag: [{ tag: { id: 't1', name: 'React', slug: 'react' } }],
      },
    ]);
    prismaService.article.count.mockResolvedValue(1);

    const service = new ArticlesService(prismaService as never);
    const result = await service.searchPublic({ keyword: 'React', page: 2, pageSize: 3 });

    expect(prismaService.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'published',
          OR: [
            { title: { contains: 'React' } },
            { excerpt: { contains: 'React' } },
            { content: { contains: 'React' } },
          ],
        }),
        skip: 3,
        take: 3,
        orderBy: [{ isTop: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
    );
    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(3);
    expect(result.list[0]?.slug).toBe('react-search');
  });
});
