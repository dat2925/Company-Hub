import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthUser } from '../common/types';
import { BulkAssignShiftDto, CreateShiftAssignmentDto, CreateShiftDto, ShiftAssignmentQueryDto, ShiftQueryDto, UpdateShiftAssignmentDto, UpdateShiftDto } from './dto/shift.dto';
import { ShiftAssignmentsService, ShiftsService } from './shifts.service';

@ApiTags('Shifts') @ApiBearerAuth() @Controller('shifts') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.EMPLOYEE)
export class ShiftsController {
  constructor(private readonly service: ShiftsService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: ShiftQueryDto) { return this.service.list(user, query); }
  @Get('options/list') options(@CurrentUser() user: AuthUser) { return this.service.options(user); }
  @Get(':id') get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.get(user, id); }
  @Post() @Roles(Role.ADMIN) create(@CurrentUser() user: AuthUser, @Body() dto: CreateShiftDto) { return this.service.create(user, dto); }
  @Patch(':id') @Roles(Role.ADMIN) update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateShiftDto) { return this.service.update(user, id, dto); }
  @Delete(':id') @Roles(Role.ADMIN) remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.remove(user, id); }
}

@ApiTags('Shift assignments') @ApiBearerAuth() @Controller('shift-assignments') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.EMPLOYEE)
export class ShiftAssignmentsController {
  constructor(private readonly service: ShiftAssignmentsService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: ShiftAssignmentQueryDto) { return this.service.list(user, query); }
  @Post('bulk') @Roles(Role.ADMIN) bulkCreate(@CurrentUser() user: AuthUser, @Body() dto: BulkAssignShiftDto) { return this.service.bulkCreate(user, dto); }
  @Get(':id') get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.get(user, id); }
  @Post() @Roles(Role.ADMIN) create(@CurrentUser() user: AuthUser, @Body() dto: CreateShiftAssignmentDto) { return this.service.create(user, dto); }
  @Patch(':id') @Roles(Role.ADMIN) update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateShiftAssignmentDto) { return this.service.update(user, id, dto); }
  @Delete(':id') @Roles(Role.ADMIN) remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.remove(user, id); }
}
