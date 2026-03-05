import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

import { CreateUploadTicketDto } from './dto/create-upload-ticket.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-ticket')
  async createUploadTicket(
    @CurrentUser() user: CurrentUserPayload,
    @Body() payload: CreateUploadTicketDto,
  ) {
    return this.mediaService.createUploadTicket(user.userId, payload);
  }

  @Get()
  async listAssets() {
    return this.mediaService.listAssets();
  }

  @Delete(':id')
  async removeAsset(@Param('id') id: string) {
    return this.mediaService.removeAsset(id);
  }
}
