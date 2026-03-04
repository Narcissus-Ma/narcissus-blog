import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Public } from '../common/decorators/public.decorator';

import { CategoriesService } from './categories.service';
import { UpsertCategoryDto } from './dto/upsert-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get('public')
  async listPublic() {
    return this.categoriesService.list();
  }

  @ApiBearerAuth()
  @Get()
  async listAdmin() {
    return this.categoriesService.list();
  }

  @ApiBearerAuth()
  @Post()
  async create(@Body() payload: UpsertCategoryDto) {
    return this.categoriesService.create(payload);
  }

  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpsertCategoryDto) {
    return this.categoriesService.update(id, payload);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
