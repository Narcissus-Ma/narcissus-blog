import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { UpsertCategoryDto } from './dto/upsert-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async list() {
    const list = await this.prismaService.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return list.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      articleCount: item._count.articles,
    }));
  }

  async create(payload: UpsertCategoryDto) {
    return this.prismaService.category.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? '',
      },
    });
  }

  async update(id: string, payload: UpsertCategoryDto) {
    const existing = await this.prismaService.category.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('分类不存在');
    }

    return this.prismaService.category.update({
      where: { id },
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? '',
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prismaService.category.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('分类不存在');
    }

    await this.prismaService.category.delete({ where: { id } });

    return { id };
  }
}
