import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { UpsertTagDto } from './dto/upsert-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prismaService: PrismaService) {}

  async list() {
    const list = await this.prismaService.tag.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { articleTag: true },
        },
      },
    });

    return list.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      articleCount: item._count.articleTag,
    }));
  }

  async create(payload: UpsertTagDto) {
    return this.prismaService.tag.create({
      data: {
        name: payload.name,
        slug: payload.slug,
      },
    });
  }

  async update(id: string, payload: UpsertTagDto) {
    const existing = await this.prismaService.tag.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('标签不存在');
    }

    return this.prismaService.tag.update({
      where: { id },
      data: {
        name: payload.name,
        slug: payload.slug,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prismaService.tag.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('标签不存在');
    }

    await this.prismaService.tag.delete({ where: { id } });

    return { id };
  }
}
