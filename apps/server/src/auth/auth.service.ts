import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface TokenPayload {
  sub: string;
  username: string;
  jti: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    nickname: string;
  };
}

function parseExpiryToMilliseconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = (match[2] ?? '').toLowerCase();

  const unitMap: Record<'s' | 'm' | 'h' | 'd', number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  if (!['s', 'm', 'h', 'd'].includes(unit)) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  return value * unitMap[unit as 's' | 'm' | 'h' | 'd'];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async ensureDefaultAdmin(): Promise<void> {
    const hasUser = await this.prismaService.user.count();

    if (hasUser > 0) {
      return;
    }

    const username = this.configService.get<string>('DEFAULT_ADMIN_USERNAME', 'admin');
    const password = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD', '123456');
    const nickname = this.configService.get<string>('DEFAULT_ADMIN_NICKNAME', '站长');

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prismaService.user.create({
      data: {
        username,
        passwordHash,
        nickname,
      },
    });
  }

  async login(payload: LoginDto): Promise<LoginResult> {
    const user = await this.prismaService.user.findUnique({
      where: {
        username: payload.username,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isMatched = await bcrypt.compare(payload.password, user.passwordHash);

    if (!isMatched) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return this.createLoginResult(user);
  }

  async refreshToken(
    payload: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let decoded: TokenPayload;

    try {
      decoded = await this.jwtService.verifyAsync<TokenPayload>(payload.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }

    const records = await this.prismaService.refreshToken.findMany({
      where: {
        userId: decoded.sub,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    let tokenRecordId = '';

    for (const record of records) {
      const matched = await bcrypt.compare(payload.refreshToken, record.tokenHash);
      if (matched) {
        tokenRecordId = record.id;
        break;
      }
    }

    if (!tokenRecordId) {
      throw new UnauthorizedException('刷新令牌无效');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: decoded.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    await this.prismaService.refreshToken.update({
      where: { id: tokenRecordId },
      data: { revokedAt: new Date() },
    });

    const loginResult = await this.createLoginResult(user);

    return {
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken,
    };
  }

  private async createLoginResult(user: User): Promise<LoginResult> {
    const jti = uuidv4();

    const tokenPayload: TokenPayload = {
      sub: user.id,
      username: user.username,
      jti,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '2h'),
    });

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresIn = parseExpiryToMilliseconds(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    );

    await this.prismaService.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + expiresIn),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
      },
    };
  }
}
