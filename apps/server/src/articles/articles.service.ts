import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { ArticleQueryDto } from './dto/article-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

function mapArticleSummary(article: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  category: { name: string } | null;
  articleTag: { tag: { name: string } }[];
}) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    coverUrl: article.coverUrl,
    status: article.status,
    categoryName: article.category?.name ?? '',
    tags: article.articleTag.map((item) => item.tag.name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    publishedAt: article.publishedAt?.toISOString() ?? null,
  };
}

@Injectable()
export class ArticlesService {
  constructor(private readonly prismaService: PrismaService) {}

  async listPublic(query: ArticleQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.ArticleWhereInput = {
      status: 'published',
      OR: query.keyword
        ? [
            { title: { contains: query.keyword } },
            { excerpt: { contains: query.keyword } },
            { content: { contains: query.keyword } },
          ]
        : undefined,
    };

    const [list, total] = await this.prismaService.$transaction([
      this.prismaService.article.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { name: true } },
          articleTag: { include: { tag: { select: { name: true } } } },
        },
        orderBy: [{ isTop: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prismaService.article.count({ where }),
    ]);

    return {
      list: list.map(mapArticleSummary),
      total,
      page,
      pageSize,
    };
  }

  async listAdmin(query: ArticleQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.ArticleWhereInput = {
      status: query.status,
      OR: query.keyword
        ? [
            { title: { contains: query.keyword } },
            { excerpt: { contains: query.keyword } },
            { content: { contains: query.keyword } },
          ]
        : undefined,
    };

    const [list, total] = await this.prismaService.$transaction([
      this.prismaService.article.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { name: true } },
          articleTag: { include: { tag: { select: { name: true } } } },
        },
        orderBy: [{ updatedAt: 'desc' }],
      }),
      this.prismaService.article.count({ where }),
    ]);

    return {
      list: list.map(mapArticleSummary),
      total,
      page,
      pageSize,
    };
  }

  async getPublicBySlug(slug: string) {
    const article = await this.prismaService.article.findFirst({
      where: {
        slug,
        status: 'published',
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        articleTag: { include: { tag: true } },
      },
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    return {
      ...mapArticleSummary(article),
      content: article.content,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      categoryId: article.category?.id ?? null,
      categorySlug: article.category?.slug ?? null,
      tagIds: article.articleTag.map((item) => item.tag.id),
      tagItems: article.articleTag.map((item) => ({
        id: item.tag.id,
        name: item.tag.name,
        slug: item.tag.slug,
      })),
    };
  }

  async getAdminById(id: string) {
    const article = await this.prismaService.article.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        articleTag: { include: { tag: true } },
      },
    });

    if (!article) {
      throw new NotFoundException('文章不存在');
    }

    return {
      ...mapArticleSummary(article),
      content: article.content,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      categoryId: article.category?.id ?? null,
      tagIds: article.articleTag.map((item) => item.tag.id),
      isTop: article.isTop,
    };
  }

  async create(userId: string, payload: CreateArticleDto) {
    const created = await this.prismaService.article.create({
      data: {
        title: payload.title,
        slug: payload.slug,
        excerpt: payload.excerpt ?? '',
        content: payload.content,
        coverUrl: payload.coverUrl ?? '',
        status: payload.status ?? 'draft',
        seoTitle: payload.seoTitle ?? payload.title,
        seoDescription: payload.seoDescription ?? payload.excerpt ?? '',
        publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
        categoryId: payload.categoryId,
        isTop: payload.isTop ?? false,
        authorId: userId,
        articleTag: payload.tagIds?.length
          ? {
              createMany: {
                data: payload.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : undefined,
      },
      include: {
        category: { select: { name: true } },
        articleTag: { include: { tag: { select: { name: true } } } },
      },
    });

    return mapArticleSummary(created);
  }

  async update(id: string, payload: UpdateArticleDto) {
    const existing = await this.prismaService.article.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('文章不存在');
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.article.update({
        where: { id },
        data: {
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt,
          content: payload.content,
          coverUrl: payload.coverUrl,
          status: payload.status,
          seoTitle: payload.seoTitle,
          seoDescription: payload.seoDescription,
          categoryId: payload.categoryId,
          isTop: payload.isTop,
          publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
        },
      });

      if (payload.tagIds) {
        await tx.articleTag.deleteMany({ where: { articleId: id } });

        if (payload.tagIds.length > 0) {
          await tx.articleTag.createMany({
            data: payload.tagIds.map((tagId) => ({ articleId: id, tagId })),
          });
        }
      }
    });

    return this.getAdminById(id);
  }

  async remove(id: string) {
    const existing = await this.prismaService.article.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('文章不存在');
    }

    await this.prismaService.article.delete({ where: { id } });

    return {
      id,
    };
  }
}
