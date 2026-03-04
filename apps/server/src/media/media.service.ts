import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUploadTicketDto } from './dto/create-upload-ticket.dto';

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createUploadTicket(userId: string, payload: CreateUploadTicketDto) {
    const timestamp = Date.now();
    const key = `uploads/${timestamp}-${sanitizeFilename(payload.filename)}`;
    const base = this.configService.get<string>('UPLOAD_CDN_BASE_URL', 'https://cdn.example.com');
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const url = `${normalizedBase}/${key}`;

    await this.prismaService.mediaAsset.create({
      data: {
        key,
        url,
        mimeType: payload.mimeType,
        size: payload.size ?? 0,
        uploaderId: userId,
      },
    });

    return {
      key,
      url,
      uploadProvider: 's3-compatible',
      note: '当前为占位上传票据接口，请在生产环境对接 R2/OSS SDK',
    };
  }

  async listAssets() {
    return this.prismaService.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
