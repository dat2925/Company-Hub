import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class LoginDto { @ApiProperty() @IsEmail() email!: string; @ApiProperty() @IsString() @MinLength(8) password!: string }
export class RefreshDto { @ApiProperty() @IsString() refreshToken!: string }
export class ChangePasswordDto {
  @ApiProperty() @IsString() @MinLength(8) currentPassword!: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword!: string;
}
