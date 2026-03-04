import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';

import { UpsertTagDto } from './dto/upsert-tag.dto';
import { TagsService } from './tags.service';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get('public')
  async listPublic() {
    return this.tagsService.list();
  }

  @ApiBearerAuth()
  @Get()
  async listAdmin() {
    return this.tagsService.list();
  }

  @ApiBearerAuth()
  @Post()
  async create(@Body() payload: UpsertTagDto) {
    return this.tagsService.create(payload);
  }

  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpsertTagDto) {
    return this.tagsService.update(id, payload);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tagsService.remove(id);
  }
}
