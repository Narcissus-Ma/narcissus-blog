import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from '../prisma/prisma.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.authService.ensureDefaultAdmin();

    const setting = await this.prismaService.siteSetting.findUnique({ where: { id: 1 } });

    if (!setting) {
      await this.prismaService.siteSetting.create({
        data: {
          id: 1,
          siteName: 'Narcissus的个人博客',
          siteDescription: '分享一些程序员开发，生活学习记录',
          navItems: [
            { name: '隧道', path: '/archives' },
            { name: '分类', path: '/categories' },
            { name: '标签', path: '/tags' },
          ],
          recommendations: [],
          defaultSeoTitle: 'Narcissus的个人博客',
          defaultSeoDescription: '分享一些程序员开发，生活学习记录',
          defaultOgImage: this.configService.get<string>('UPLOAD_CDN_BASE_URL', ''),
        },
      });
    }
  }
}
