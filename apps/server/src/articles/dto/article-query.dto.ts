import { IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ArticleQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  status?: 'draft' | 'published';
}
