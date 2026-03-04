import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class NavItemDto {
  @IsString()
  @MaxLength(30)
  name!: string;

  @IsString()
  @MaxLength(120)
  path!: string;
}

class RecommendationDto {
  @IsString()
  @MaxLength(80)
  title!: string;

  @IsString()
  articleId!: string;
}

export class UpdateSiteSettingDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  siteName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  siteDescription?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => NavItemDto)
  navItems?: NavItemDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => RecommendationDto)
  recommendations?: RecommendationDto[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  defaultSeoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  defaultSeoDescription?: string;

  @IsOptional()
  @IsString()
  defaultOgImage?: string;
}
