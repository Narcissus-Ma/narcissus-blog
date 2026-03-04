import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateUploadTicketDto {
  @IsString()
  @MaxLength(120)
  filename!: string;

  @IsString()
  @MaxLength(80)
  mimeType!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  size?: number;
}
