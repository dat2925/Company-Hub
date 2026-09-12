import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EmployeeStatus, IssuePriority, IssueStatus, MeetingStatus, ProjectStatus } from '@prisma/client';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsOptional, IsString, IsUrl, IsUUID, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartmentDto {
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}
export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

export class UpdateDepartmentPermissionDto {
  @ApiProperty() @IsBoolean() canCreate!: boolean;
  @ApiProperty() @IsBoolean() canUpdate!: boolean;
  @ApiProperty() @IsBoolean() canDelete!: boolean;
  @ApiProperty() @IsBoolean() canAssignPosition!: boolean;
}

export class CreatePositionDto {
  @ApiProperty() @IsUUID() departmentId!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}
export class UpdatePositionDto extends PartialType(CreatePositionDto) {}

export class CreateEmployeeDto {
  @ApiProperty() @IsString() employeeCode!: string;
  @ApiProperty() @IsString() @MinLength(2) fullName!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() positionId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() hireDate?: Date;
  @ApiPropertyOptional({ enum: EmployeeStatus }) @IsOptional() @IsEnum(EmployeeStatus) status?: EmployeeStatus;
  @ApiPropertyOptional({ description: 'Provide to create a linked EMPLOYEE login' }) @IsOptional() @IsString() @MinLength(8) password?: string;
}
export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class CreateMeetingDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() meetingUrl?: string;
  @ApiProperty() @Type(() => Date) @IsDate() startAt!: Date;
  @ApiProperty() @Type(() => Date) @IsDate() endAt!: Date;
  @ApiPropertyOptional({ enum: MeetingStatus }) @IsOptional() @IsEnum(MeetingStatus) status?: MeetingStatus;
}
export class UpdateMeetingDto extends PartialType(CreateMeetingDto) {}

export class CreateProjectDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() startDate?: Date;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() endDate?: Date;
  @ApiPropertyOptional({ enum: ProjectStatus }) @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
}
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class CreateIssueDto {
  @ApiProperty() @IsUUID() projectId!: string;
  @ApiProperty() @IsUUID() assigneeId!: string;
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: IssuePriority }) @IsOptional() @IsEnum(IssuePriority) priority?: IssuePriority;
  @ApiPropertyOptional({ enum: IssueStatus }) @IsOptional() @IsEnum(IssueStatus) status?: IssueStatus;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() dueDate?: Date;
}
export class UpdateIssueDto extends PartialType(CreateIssueDto) {}

export class CreateBulletinDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiProperty() @IsString() @MinLength(2) content!: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() publishedAt?: Date;
}
export class UpdateBulletinDto extends PartialType(CreateBulletinDto) {}

export class CreateNotificationDto {
  @ApiProperty() @IsString() @MinLength(2) title!: string;
  @ApiProperty() @IsString() @MinLength(2) message!: string;
}
export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
