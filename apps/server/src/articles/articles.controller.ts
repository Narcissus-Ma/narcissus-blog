import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

import { ArticlesService } from './articles.service';
import { ArticleQueryDto } from './dto/article-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get('public')
  async listPublic(@Query() query: ArticleQueryDto) {
    return this.articlesService.listPublic(query);
  }

  @Public()
  @Get('public/:slug')
  async getPublicBySlug(@Param('slug') slug: string) {
    return this.articlesService.getPublicBySlug(slug);
  }

  @ApiBearerAuth()
  @Get()
  async listAdmin(@Query() query: ArticleQueryDto) {
    return this.articlesService.listAdmin(query);
  }

  @ApiBearerAuth()
  @Get(':id')
  async getAdminById(@Param('id') id: string) {
    return this.articlesService.getAdminById(id);
  }

  @ApiBearerAuth()
  @Post()
  async create(@CurrentUser() user: CurrentUserPayload, @Body() payload: CreateArticleDto) {
    return this.articlesService.create(user.userId, payload);
  }

  @ApiBearerAuth()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateArticleDto) {
    return this.articlesService.update(id, payload);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
