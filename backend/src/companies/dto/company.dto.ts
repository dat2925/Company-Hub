import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CompanyStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
export class CreateCompanyDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string;
  @ApiProperty() @IsString() @MinLength(2) code!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() phone!: string;
  @ApiProperty() @IsString() address!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() logoUrl?: string;
  @ApiPropertyOptional({ enum: CompanyStatus }) @IsOptional() @IsEnum(CompanyStatus) status?: CompanyStatus;
}
export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
export class CreateCompanyAdminDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(8) password!: string;
  @ApiProperty() @IsString() @MinLength(2) fullName!: string;
}
