import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthUser } from '../common/types';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto, CheckInDto, CheckOutDto, CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EMPLOYEE)
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post('check-in') checkIn(@CurrentUser() user: AuthUser, @Body() dto: CheckInDto) { return this.service.checkIn(user, dto); }
  @Post('check-out') checkOut(@CurrentUser() user: AuthUser, @Body() dto: CheckOutDto) { return this.service.checkOut(user, dto); }
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: AttendanceQueryDto) { return this.service.list(user, query); }
  @Get('summary') summary(@CurrentUser() user: AuthUser, @Query() query: AttendanceQueryDto) { return this.service.summary(user, query); }
  @Get(':id') get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.get(user, id); }
  @Post() @Roles(Role.ADMIN) create(@CurrentUser() user: AuthUser, @Body() dto: CreateAttendanceDto) { return this.service.create(user, dto); }
  @Patch(':id') @Roles(Role.ADMIN) update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateAttendanceDto) { return this.service.update(user, id, dto); }
  @Delete(':id') @Roles(Role.ADMIN) remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.remove(user, id); }
}
