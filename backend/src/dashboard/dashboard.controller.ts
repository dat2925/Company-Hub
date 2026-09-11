import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthUser } from '../common/types';
import { DashboardService } from './dashboard.service';
@ApiTags('Dashboard') @ApiBearerAuth() @Controller('dashboard') @UseGuards(JwtAuthGuard)
export class DashboardController{constructor(private s:DashboardService){}@Get()get(@CurrentUser()u:AuthUser){return this.s.get(u)}}
