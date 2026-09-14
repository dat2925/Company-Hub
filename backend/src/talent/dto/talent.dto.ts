import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { OpportunityApplicationStatus, SkillSource, TalentOpportunityStatus, TalentOpportunityType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

export class SkillQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Transform(({ value }) => value === true || value === 'true') isActive?: boolean;
}

export class CreateSkillDto {
  @ApiProperty() @IsString() @MinLength(1) code!: string;
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateSkillDto extends PartialType(CreateSkillDto) {}

export class UpsertEmployeeSkillDto {
  @ApiProperty({ minimum: 1, maximum: 5 }) @Type(() => Number) @IsInt() @Min(1) @Max(5) level!: number;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(80) yearsExperience?: number;
  @ApiPropertyOptional({ enum: SkillSource }) @IsOptional() @IsEnum(SkillSource) source?: SkillSource;
  @ApiPropertyOptional() @IsOptional() @IsString() evidence?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() lastUsedAt?: string;
}

export class UpsertSkillRequirementDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) minimumLevel?: number;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10) weight?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isRequired?: boolean;
}

export class TalentMatchQueryDto {
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 10;
}

export class BusFactorQueryDto {
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(20) maxHolders = 1;
  @ApiPropertyOptional({ default: 3 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5) minimumLevel = 3;
}

export class OpportunityQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TalentOpportunityStatus }) @IsOptional() @IsEnum(TalentOpportunityStatus) status?: TalentOpportunityStatus;
  @ApiPropertyOptional({ enum: TalentOpportunityType }) @IsOptional() @IsEnum(TalentOpportunityType) type?: TalentOpportunityType;
}

export class CreateOpportunityDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: TalentOpportunityType }) @IsEnum(TalentOpportunityType) type!: TalentOpportunityType;
  @ApiPropertyOptional({ enum: TalentOpportunityStatus }) @IsOptional() @IsEnum(TalentOpportunityStatus) status?: TalentOpportunityStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() projectId?: string;
  @ApiPropertyOptional({ default: 1 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) openings?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString({ strict: true }) endDate?: string;
}

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {}

export class ApplyOpportunityDto {
  @ApiPropertyOptional() @IsOptional() @IsString() message?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: OpportunityApplicationStatus }) @IsEnum(OpportunityApplicationStatus) status!: OpportunityApplicationStatus;
}
