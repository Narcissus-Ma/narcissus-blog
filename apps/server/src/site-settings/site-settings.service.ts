import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { UpdateSiteSettingDto } from './dto/update-site-setting.dto';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCurrent() {
    const setting = await this.prismaService.siteSetting.findUnique({
      where: { id: 1 },
    });

    if (!setting) {
      return {
        siteName: 'Narcissus的个人博客',
        siteDescription: '分享一些程序员开发，生活学习记录',
        navItems: [],
        recommendations: [],
        defaultSeoTitle: 'Narcissus的个人博客',
        defaultSeoDescription: '分享一些程序员开发，生活学习记录',
        defaultOgImage: '',
      };
    }

    return {
      siteName: setting.siteName,
      siteDescription: setting.siteDescription,
      navItems: setting.navItems,
      recommendations: setting.recommendations,
      defaultSeoTitle: setting.defaultSeoTitle,
      defaultSeoDescription: setting.defaultSeoDescription,
      defaultOgImage: setting.defaultOgImage,
    };
  }

  async update(payload: UpdateSiteSettingDto) {
    const navItems = payload.navItems as Prisma.InputJsonValue | undefined;
    const recommendations = payload.recommendations as Prisma.InputJsonValue | undefined;

    await this.prismaService.siteSetting.upsert({
      where: { id: 1 },
      update: {
        siteName: payload.siteName,
        siteDescription: payload.siteDescription,
        navItems,
        recommendations,
        defaultSeoTitle: payload.defaultSeoTitle,
        defaultSeoDescription: payload.defaultSeoDescription,
        defaultOgImage: payload.defaultOgImage,
      },
      create: {
        id: 1,
        siteName: payload.siteName ?? 'Narcissus的个人博客',
        siteDescription: payload.siteDescription ?? '分享一些程序员开发，生活学习记录',
        navItems: navItems ?? ([] as Prisma.InputJsonValue),
        recommendations: recommendations ?? ([] as Prisma.InputJsonValue),
        defaultSeoTitle: payload.defaultSeoTitle ?? 'Narcissus的个人博客',
        defaultSeoDescription: payload.defaultSeoDescription ?? '分享一些程序员开发，生活学习记录',
        defaultOgImage: payload.defaultOgImage ?? '',
      },
    });

    return this.getCurrent();
  }
}
