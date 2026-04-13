import { readdir } from 'node:fs/promises';
import path from 'node:path';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
    await this.ensureMigrationState();
  }

  async ensureMigrationState(): Promise<void> {
    const localMigrationNames = await this.getLocalMigrationNames();
    const appliedMigrationNames = await this.getAppliedMigrationNames();
    const missingMigrationNames = localMigrationNames.filter((name) => !appliedMigrationNames.includes(name));

    if (missingMigrationNames.length > 0) {
      throw new Error(
        `数据库迁移未同步，请先执行 pnpm --filter @narcissus/server prisma:migrate。缺失迁移：${missingMigrationNames.join(
          ', ',
        )}`,
      );
    }
  }

  async getLocalMigrationNames(): Promise<string[]> {
    const migrationsDirectory = path.join(process.cwd(), 'prisma', 'migrations');
    const entries = await readdir(migrationsDirectory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
  }

  async getAppliedMigrationNames(): Promise<string[]> {
    const tables = await this.$queryRawUnsafe<Array<{ name: string }>>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = '_prisma_migrations'",
    );

    if (tables.length === 0) {
      throw new Error('数据库缺少 _prisma_migrations 表，请先执行 pnpm --filter @narcissus/server prisma:migrate。');
    }

    const rows = await this.$queryRawUnsafe<Array<{ migration_name: string; finished_at: string | null }>>(
      'SELECT migration_name, finished_at FROM _prisma_migrations WHERE finished_at IS NOT NULL',
    );

    return rows.map((row) => row.migration_name).sort((left, right) => left.localeCompare(right));
  }
}
