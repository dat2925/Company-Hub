import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

export class AttendanceQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: '2026-09' }) @IsOptional() @Matches(/^\d{4}-(0[1-9]|1[0-2])$/) month?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
}

export class CheckInDto {
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class CheckOutDto extends CheckInDto {}

export class CreateAttendanceDto {
  @ApiProperty() @IsUUID() employeeId!: string;
  @ApiProperty({ example: '2026-09-12' }) @IsDateString({ strict: true }) workDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() checkIn?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() checkOut?: string;
  @ApiPropertyOptional({ enum: AttendanceStatus }) @IsOptional() @IsEnum(AttendanceStatus) status?: AttendanceStatus;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1440) workedMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1440) overtimeMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {}
