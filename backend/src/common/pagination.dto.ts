import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
export class PaginationDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 10;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
export const pageMeta = (page: number, pageSize: number, totalItems: number) => ({ page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) });
