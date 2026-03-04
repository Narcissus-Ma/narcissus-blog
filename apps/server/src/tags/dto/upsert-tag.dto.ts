import { IsString, MaxLength } from 'class-validator';

export class UpsertTagDto {
  @IsString()
  @MaxLength(30)
  name!: string;

  @IsString()
  @MaxLength(40)
  slug!: string;
}
