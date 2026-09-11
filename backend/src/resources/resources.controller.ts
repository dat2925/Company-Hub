import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { PaginationDto } from '../common/pagination.dto';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthUser } from '../common/types';
import { CreateBulletinDto, CreateDepartmentDto, CreateEmployeeDto, CreateIssueDto, CreateMeetingDto, CreateNotificationDto, CreatePositionDto, CreateProjectDto, UpdateBulletinDto, UpdateDepartmentDto, UpdateEmployeeDto, UpdateIssueDto, UpdateMeetingDto, UpdateNotificationDto, UpdatePositionDto, UpdateProjectDto } from './dto/resource.dto';
import { BulletinsService, DepartmentsService, EmployeesService, IssuesService, MeetingsService, NotificationsService, PositionsService, ProjectsService } from './resources.service';

@ApiTags('Departments') @ApiBearerAuth() @Controller('departments') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(Role.ADMIN)
export class DepartmentsController { constructor(private s:DepartmentsService){} @Get() list(@CurrentUser()u:AuthUser,@Query()q:PaginationDto){return this.s.list(u,q)} @Get(':id') get(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.get(u,id)} @Post() create(@CurrentUser()u:AuthUser,@Body()d:CreateDepartmentDto){return this.s.create(u,d)} @Patch(':id') update(@CurrentUser()u:AuthUser,@Param('id')id:string,@Body()d:UpdateDepartmentDto){return this.s.update(u,id,d)} @Delete(':id') remove(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.remove(u,id)} }

@ApiTags('Positions') @ApiBearerAuth() @Controller('positions') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(Role.ADMIN)
export class PositionsController { constructor(private s:PositionsService){} @Get() list(@CurrentUser()u:AuthUser,@Query()q:PaginationDto){return this.s.list(u,q)} @Get(':id') get(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.get(u,id)} @Post() create(@CurrentUser()u:AuthUser,@Body()d:CreatePositionDto){return this.s.create(u,d)} @Patch(':id') update(@CurrentUser()u:AuthUser,@Param('id')id:string,@Body()d:UpdatePositionDto){return this.s.update(u,id,d)} @Delete(':id') remove(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.remove(u,id)} }

@ApiTags('Employees') @ApiBearerAuth() @Controller('employees') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(Role.ADMIN)
export class EmployeesController { constructor(private s:EmployeesService){} @Get() list(@CurrentUser()u:AuthUser,@Query()q:PaginationDto){return this.s.list(u,q)} @Get('options/list') @Roles(Role.ADMIN,Role.EMPLOYEE) options(@CurrentUser()u:AuthUser){return this.s.options(u)} @Get(':id') get(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.get(u,id)} @Post() create(@CurrentUser()u:AuthUser,@Body()d:CreateEmployeeDto){return this.s.create(u,d)} @Patch(':id') update(@CurrentUser()u:AuthUser,@Param('id')id:string,@Body()d:UpdateEmployeeDto){return this.s.update(u,id,d)} @Delete(':id') remove(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.remove(u,id)} }

@ApiTags('Meetings') @ApiBearerAuth() @Controller('meetings') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(Role.ADMIN,Role.EMPLOYEE)
export class MeetingsController { constructor(private s:MeetingsService){} @Get() list(@CurrentUser()u:AuthUser,@Query()q:PaginationDto){return this.s.list(u,q)} @Get(':id') get(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.get(u,id)} @Post() create(@CurrentUser()u:AuthUser,@Body()d:CreateMeetingDto){return this.s.create(u,d)} @Patch(':id') update(@CurrentUser()u:AuthUser,@Param('id')id:string,@Body()d:UpdateMeetingDto){return this.s.update(u,id,d)} @Delete(':id') remove(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.remove(u,id)} }

@ApiTags('Projects') @ApiBearerAuth() @Controller('projects') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(Role.ADMIN,Role.EMPLOYEE)
export class ProjectsController { constructor(private s:ProjectsService){} @Get() list(@CurrentUser()u:AuthUser,@Query()q:PaginationDto){return this.s.list(u,q)} @Get(':id') get(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.get(u,id)} @Post() create(@CurrentUser()u:AuthUser,@Body()d:CreateProjectDto){return this.s.create(u,d)} @Patch(':id') update(@CurrentUser()u:AuthUser,@Param('id')id:string,@Body()d:UpdateProjectDto){return this.s.update(u,id,d)} @Delete(':id') remove(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.remove(u,id)} }

@ApiTags('Issues') @ApiBearerAuth() @Controller('issues') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(Role.ADMIN,Role.EMPLOYEE)
export class IssuesController { constructor(private s:IssuesService){} @Get() list(@CurrentUser()u:AuthUser,@Query()q:PaginationDto){return this.s.list(u,q)} @Get(':id') get(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.get(u,id)} @Post() create(@CurrentUser()u:AuthUser,@Body()d:CreateIssueDto){return this.s.create(u,d)} @Patch(':id') update(@CurrentUser()u:AuthUser,@Param('id')id:string,@Body()d:UpdateIssueDto){return this.s.update(u,id,d)} @Delete(':id') remove(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.remove(u,id)} }

@ApiTags('Bulletins') @ApiBearerAuth() @Controller('bulletins') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(Role.ADMIN,Role.EMPLOYEE)
export class BulletinsController { constructor(private s:BulletinsService){} @Get() list(@CurrentUser()u:AuthUser,@Query()q:PaginationDto){return this.s.list(u,q)} @Get(':id') get(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.get(u,id)} @Post() create(@CurrentUser()u:AuthUser,@Body()d:CreateBulletinDto){return this.s.create(u,d)} @Patch(':id') update(@CurrentUser()u:AuthUser,@Param('id')id:string,@Body()d:UpdateBulletinDto){return this.s.update(u,id,d)} @Delete(':id') remove(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.remove(u,id)} }

@ApiTags('Notifications') @ApiBearerAuth() @Controller('notifications') @UseGuards(JwtAuthGuard,RolesGuard) @Roles(Role.ADMIN,Role.EMPLOYEE)
export class NotificationsController { constructor(private s:NotificationsService){} @Get() list(@CurrentUser()u:AuthUser,@Query()q:PaginationDto){return this.s.list(u,q)} @Get(':id') get(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.get(u,id)} @Post() create(@CurrentUser()u:AuthUser,@Body()d:CreateNotificationDto){return this.s.create(u,d)} @Patch(':id') update(@CurrentUser()u:AuthUser,@Param('id')id:string,@Body()d:UpdateNotificationDto){return this.s.update(u,id,d)} @Delete(':id') remove(@CurrentUser()u:AuthUser,@Param('id')id:string){return this.s.remove(u,id)} }
