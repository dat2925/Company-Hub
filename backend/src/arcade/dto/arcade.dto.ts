import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ArcadeChallengeType, ArcadeContentStatus, ArcadeRoomMode, ArcadeSubmissionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, Min, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/pagination.dto';

export class ArcadeContentQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ArcadeContentStatus }) @IsOptional() @IsEnum(ArcadeContentStatus) status?: ArcadeContentStatus;
  @ApiPropertyOptional({ enum: ArcadeChallengeType }) @IsOptional() @IsEnum(ArcadeChallengeType) type?: ArcadeChallengeType;
}

export class CreateArcadeChallengeDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: ArcadeChallengeType }) @IsEnum(ArcadeChallengeType) type!: ArcadeChallengeType;
  @ApiProperty() @IsString() @MinLength(2) question!: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMinSize(2) @IsString({ each: true }) options?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() correctAnswer?: string;
  @ApiPropertyOptional({ default: 10 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) points?: number;
  @ApiPropertyOptional({ enum: ArcadeContentStatus }) @IsOptional() @IsEnum(ArcadeContentStatus) status?: ArcadeContentStatus;
  @ApiProperty() @IsDateString() startsAt!: string;
  @ApiProperty() @IsDateString() endsAt!: string;
}

export class UpdateArcadeChallengeDto extends PartialType(CreateArcadeChallengeDto) {}

export class PlayArcadeChallengeDto {
  @ApiProperty() @IsString() @MinLength(1) answer!: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(3_600_000) durationMs?: number;
}

export class CreateArcadeMissionDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) points?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() requiresProof?: boolean;
  @ApiPropertyOptional({ enum: ArcadeContentStatus }) @IsOptional() @IsEnum(ArcadeContentStatus) status?: ArcadeContentStatus;
  @ApiProperty() @IsDateString() startsAt!: string;
  @ApiProperty() @IsDateString() endsAt!: string;
}

export class UpdateArcadeMissionDto extends PartialType(CreateArcadeMissionDto) {}

export class MissionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ArcadeContentStatus }) @IsOptional() @IsEnum(ArcadeContentStatus) status?: ArcadeContentStatus;
}

export class SubmitArcadeMissionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() proofText?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_protocol: true }) proofUrl?: string;
}

export class MissionSubmissionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ArcadeSubmissionStatus }) @IsOptional() @IsEnum(ArcadeSubmissionStatus) status?: ArcadeSubmissionStatus;
}

export class ReviewMissionSubmissionDto {
  @ApiProperty({ enum: ArcadeSubmissionStatus }) @IsEnum(ArcadeSubmissionStatus) status!: ArcadeSubmissionStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() managerComment?: string;
}

export enum ArcadeLeaderboardPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME',
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({ enum: ArcadeLeaderboardPeriod }) @IsOptional() @IsEnum(ArcadeLeaderboardPeriod) period: ArcadeLeaderboardPeriod = ArcadeLeaderboardPeriod.WEEKLY;
  @ApiPropertyOptional({ default: 20 }) @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}

export class MatchmakeRoomDto {
  @ApiProperty({ enum: ArcadeRoomMode }) @IsEnum(ArcadeRoomMode) mode!: ArcadeRoomMode;
  @ApiPropertyOptional({ default: 4 }) @IsOptional() @Type(() => Number) @IsInt() @Min(2) @Max(8) maxPlayers = 4;
}
