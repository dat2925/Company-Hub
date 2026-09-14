import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateShiftDto {
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ example: '08:00' }) @Matches(timePattern) startTime!: string;
  @ApiProperty({ example: '17:00' }) @Matches(timePattern) endTime!: string;
  @ApiPropertyOptional({ default: 60 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(720) breakMinutes?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(180) lateGraceMinutes?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(180) earlyLeaveGraceMinutes?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() overtimeAllowed?: boolean;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(240) overtimeThresholdMinutes?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}

export class ShiftQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Transform(({ value }) => value === true || value === 'true') isActive?: boolean;
}

export class ShiftAssignmentQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: '2026-09-01' }) @IsOptional() @IsDateString({ strict: true }) from?: string;
  @ApiPropertyOptional({ example: '2026-09-30' }) @IsOptional() @IsDateString({ strict: true }) to?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() shiftId?: string;
}

export class CreateShiftAssignmentDto {
  @ApiProperty() @IsUUID() employeeId!: string;
  @ApiProperty() @IsUUID() shiftId!: string;
  @ApiProperty({ example: '2026-09-12' }) @IsDateString({ strict: true }) workDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class UpdateShiftAssignmentDto extends PartialType(CreateShiftAssignmentDto) {}

export class BulkAssignShiftDto {
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMinSize(1) @ArrayMaxSize(200) @IsUUID('4', { each: true }) employeeIds!: string[];
  @ApiProperty() @IsUUID() shiftId!: string;
  @ApiProperty({ example: '2026-09-01' }) @IsDateString({ strict: true }) startDate!: string;
  @ApiProperty({ example: '2026-09-30' }) @IsDateString({ strict: true }) endDate!: string;
  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3, 4, 5] }) @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(7) @IsInt({ each: true }) @Min(0, { each: true }) @Max(6, { each: true }) daysOfWeek?: number[];
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}
