import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsISO4217CurrencyCode, IsNumber, IsOptional, IsPositive, IsUUID, Matches, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

export class UpsertSalaryProfileDto {
  @ApiProperty({ example: 15000000 }) @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() baseSalary!: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) allowance?: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) overtimeHourlyRate?: number;
  @ApiPropertyOptional({ default: 26 }) @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 0 }) @Min(1) @Max(31) standardWorkingDays?: number;
  @ApiPropertyOptional({ default: 480 }) @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 0 }) @Min(1) @Max(1440) standardMinutesPerDay?: number;
  @ApiPropertyOptional({ default: 'VND' }) @IsOptional() @IsISO4217CurrencyCode() currency?: string;
}

export class PayrollQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: '2026-09' }) @IsOptional() @Matches(/^\d{4}-(0[1-9]|1[0-2])$/) month?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
}

export class CalculatePayrollDto {
  @ApiProperty({ example: '2026-09' }) @Matches(/^\d{4}-(0[1-9]|1[0-2])$/) month!: string;
  @ApiPropertyOptional({ description: 'Omit to calculate all active employees with salary profiles' }) @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional({ default: 0, description: 'Only valid when employeeId is provided' }) @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) deductions?: number;
}
