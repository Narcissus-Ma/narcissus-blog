import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertCategoryDto {
  @IsString()
  @MaxLength(30)
  name!: string;

  @IsString()
  @MaxLength(40)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
