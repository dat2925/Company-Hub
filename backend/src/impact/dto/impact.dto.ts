import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EmployeeGoalStatus, ImpactEntryType, ImpactReportPeriod, ImpactReportStatus, ImpactVisibility } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

export class ImpactRangeQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) to?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
}

export class ImpactEntryQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) to?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional({ enum: ImpactEntryType }) @IsOptional() @IsEnum(ImpactEntryType) type?: ImpactEntryType;
  @ApiPropertyOptional({ enum: ImpactVisibility }) @IsOptional() @IsEnum(ImpactVisibility) visibility?: ImpactVisibility;
}

export class CreateImpactEntryDto {
  @ApiProperty({ enum: ImpactEntryType }) @IsEnum(ImpactEntryType) type!: ImpactEntryType;
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: '2026-09-13' }) @IsDateString({ strict: true }) occurredOn!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() projectId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sourceIssueId?: string;
  @ApiPropertyOptional({ example: { hoursSaved: 12, revenue: 5000000 } }) @IsOptional() @IsObject() metrics?: Record<string, string | number | boolean>;
  @ApiPropertyOptional({ enum: ImpactVisibility }) @IsOptional() @IsEnum(ImpactVisibility) visibility?: ImpactVisibility;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isHighlighted?: boolean;
}

export class UpdateImpactEntryDto extends PartialType(CreateImpactEntryDto) {}

export class CreateRecognitionDto {
  @ApiProperty() @IsUUID() receiverEmployeeId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() skillId?: string;
  @ApiProperty() @IsString() @MinLength(3) message!: string;
  @ApiPropertyOptional({ enum: ImpactVisibility }) @IsOptional() @IsEnum(ImpactVisibility) visibility?: ImpactVisibility;
}

export class RecognitionQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) to?: string;
}

export class GoalQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional({ enum: EmployeeGoalStatus }) @IsOptional() @IsEnum(EmployeeGoalStatus) status?: EmployeeGoalStatus;
}

export class CreateGoalDto {
  @ApiPropertyOptional({ description: 'ADMIN may create a goal for this employee; employees always create for themselves' }) @IsOptional() @IsUUID() employeeId?: string;
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100) progress?: number;
  @ApiPropertyOptional({ enum: EmployeeGoalStatus }) @IsOptional() @IsEnum(EmployeeGoalStatus) status?: EmployeeGoalStatus;
  @ApiProperty({ example: '2026-09-01' }) @IsDateString({ strict: true }) startDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) targetDate?: string;
}

export class UpdateGoalDto extends PartialType(CreateGoalDto) {}

export class GenerateImpactReportDto {
  @ApiProperty({ enum: ImpactReportPeriod }) @IsEnum(ImpactReportPeriod) period!: ImpactReportPeriod;
  @ApiProperty() @IsDateString({ strict: true }) periodStart!: string;
  @ApiProperty() @IsDateString({ strict: true }) periodEnd!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() selfReflection?: string;
}

export class UpdateImpactReportDto {
  @ApiPropertyOptional() @IsOptional() @IsString() selfReflection?: string;
}

export class ReviewImpactReportDto {
  @ApiProperty() @IsString() @MinLength(2) managerComment!: string;
}

export class ImpactReportQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional({ enum: ImpactReportStatus }) @IsOptional() @IsEnum(ImpactReportStatus) status?: ImpactReportStatus;
}
