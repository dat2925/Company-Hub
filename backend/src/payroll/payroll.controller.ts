import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthUser } from '../common/types';
import { PaginationDto } from '../common/pagination.dto';
import { CalculatePayrollDto, PayrollQueryDto, UpsertSalaryProfileDto } from './dto/payroll.dto';
import { PayrollService } from './payroll.service';

@ApiTags('Salary profiles') @ApiBearerAuth() @Controller('salary-profiles') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.EMPLOYEE)
export class SalaryProfilesController {
  constructor(private readonly service: PayrollService) {}
  @Get('me') myProfile(@CurrentUser() user: AuthUser) { return this.service.myProfile(user); }
  @Get() @Roles(Role.ADMIN) list(@CurrentUser() user: AuthUser, @Query() query: PaginationDto) { return this.service.listProfiles(user, query); }
  @Get(':employeeId') @Roles(Role.ADMIN) get(@CurrentUser() user: AuthUser, @Param('employeeId') employeeId: string) { return this.service.getProfile(user, employeeId); }
  @Put(':employeeId') @Roles(Role.ADMIN) upsert(@CurrentUser() user: AuthUser, @Param('employeeId') employeeId: string, @Body() dto: UpsertSalaryProfileDto) { return this.service.upsertProfile(user, employeeId, dto); }
}

@ApiTags('Payrolls') @ApiBearerAuth() @Controller('payrolls') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.EMPLOYEE)
export class PayrollController {
  constructor(private readonly service: PayrollService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: PayrollQueryDto) { return this.service.list(user, query); }
  @Get(':id') get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.get(user, id); }
  @Post('calculate') @Roles(Role.ADMIN) calculate(@CurrentUser() user: AuthUser, @Body() dto: CalculatePayrollDto) { return this.service.calculate(user, dto); }
  @Patch(':id/finalize') @Roles(Role.ADMIN) finalize(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.finalize(user, id); }
}
