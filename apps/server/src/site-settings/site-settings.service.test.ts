import { describe, expect, it, vi } from 'vitest';

import { SiteSettingsService } from './site-settings.service';

function createMockPrismaService() {
  return {
    siteSetting: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  };
}

describe('SiteSettingsService', () => {
  it('getCurrent 在无配置时应返回默认互动弹窗设置', async () => {
    const prismaService = createMockPrismaService();
    prismaService.siteSetting.findUnique.mockResolvedValue(null);

    const service = new SiteSettingsService(prismaService as never);
    const result = await service.getCurrent();

    expect(result.popupNotice).toEqual({
      enabled: false,
      title: '通知',
      message: '你好呀',
      ctaText: '查看更多',
      ctaLink: '/about',
      homeOnly: true,
    });
  });

  it('update 应保存互动弹窗配置', async () => {
    const prismaService = createMockPrismaService();
    prismaService.siteSetting.upsert.mockResolvedValue(undefined);
    prismaService.siteSetting.findUnique.mockResolvedValue({
      id: 1,
      siteName: 'Narcissus的个人博客',
      siteDescription: '分享一些程序员开发，生活学习记录',
      navItems: [],
      recommendations: [],
      defaultSeoTitle: 'Narcissus的个人博客',
      defaultSeoDescription: '分享一些程序员开发，生活学习记录',
      defaultOgImage: '',
      popupNotice: {
        enabled: true,
        title: '活动提醒',
        message: '欢迎来到新站',
        ctaText: '去看看',
        ctaLink: '/archives',
        homeOnly: false,
      },
    });

    const service = new SiteSettingsService(prismaService as never);

    const result = await service.update({
      popupNotice: {
        enabled: true,
        title: '活动提醒',
        message: '欢迎来到新站',
        ctaText: '去看看',
        ctaLink: '/archives',
        homeOnly: false,
      },
    });

    expect(prismaService.siteSetting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          popupNotice: {
            enabled: true,
            title: '活动提醒',
            message: '欢迎来到新站',
            ctaText: '去看看',
            ctaLink: '/archives',
            homeOnly: false,
          },
        }),
      }),
    );
    expect(result.popupNotice.enabled).toBe(true);
  });
});
