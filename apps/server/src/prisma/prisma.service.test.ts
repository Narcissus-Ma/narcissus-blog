import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('onModuleInit 在迁移已同步时应完成初始化', async () => {
    const service = Object.create(PrismaService.prototype) as PrismaService;
    service.$connect = vi.fn().mockResolvedValue(undefined);
    service.ensureMigrationState = vi.fn().mockResolvedValue(undefined);

    await expect(service.onModuleInit()).resolves.toBeUndefined();

    expect(service.$connect).toHaveBeenCalledTimes(1);
    expect(service.ensureMigrationState).toHaveBeenCalledTimes(1);
  });

  it('onModuleInit 在存在未应用迁移时应阻止启动', async () => {
    const service = Object.create(PrismaService.prototype) as PrismaService;
    const error = new Error('数据库迁移未同步');

    service.$connect = vi.fn().mockResolvedValue(undefined);
    service.ensureMigrationState = vi.fn().mockRejectedValue(error);

    await expect(service.onModuleInit()).rejects.toThrow('数据库迁移未同步');
    expect(service.$connect).toHaveBeenCalledTimes(1);
    expect(service.ensureMigrationState).toHaveBeenCalledTimes(1);
  });

  it('ensureMigrationState 在迁移记录完整时应通过', async () => {
    const service = Object.create(PrismaService.prototype) as PrismaService;

    service.getLocalMigrationNames = vi
      .fn()
      .mockResolvedValue(['20260304090917_init', '20260413171500_add_popup_notice']);
    service.getAppliedMigrationNames = vi
      .fn()
      .mockResolvedValue(['20260304090917_init', '20260413171500_add_popup_notice']);

    await expect(service.ensureMigrationState()).resolves.toBeUndefined();
  });

  it('ensureMigrationState 在存在未应用迁移时应抛出明确错误', async () => {
    const service = Object.create(PrismaService.prototype) as PrismaService;

    service.getLocalMigrationNames = vi
      .fn()
      .mockResolvedValue(['20260304090917_init', '20260413171500_add_popup_notice']);
    service.getAppliedMigrationNames = vi.fn().mockResolvedValue(['20260304090917_init']);

    await expect(service.ensureMigrationState()).rejects.toThrow(
      '数据库迁移未同步，请先执行 pnpm --filter @narcissus/server prisma:migrate。缺失迁移：20260413171500_add_popup_notice',
    );
  });
});
