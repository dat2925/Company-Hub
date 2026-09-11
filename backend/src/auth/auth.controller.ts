import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthUser } from '../common/types';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, RefreshDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
@ApiTags('Auth') @Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}
  @Post('login') login(@Body() dto: LoginDto) { return this.service.login(dto); }
  @Post('refresh') refresh(@Body() dto: RefreshDto) { return this.service.refresh(dto.refreshToken); }
  @Post('logout') logout(@Body() dto: RefreshDto) { return this.service.logout(dto.refreshToken); }
  @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth() me(@CurrentUser() user: AuthUser) { return this.service.me(user); }
  @Post('change-password') @UseGuards(JwtAuthGuard) @ApiBearerAuth() change(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) { return this.service.changePassword(user, dto); }
}
