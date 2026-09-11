import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { BulletinsController, DepartmentsController, EmployeesController, IssuesController, MeetingsController, NotificationsController, PositionsController, ProjectsController } from './resources.controller';
import { BulletinsService, DepartmentsService, EmployeesService, IssuesService, MeetingsService, NotificationsService, PositionsService, ProjectsService } from './resources.service';
@Module({ controllers:[DepartmentsController,PositionsController,EmployeesController,MeetingsController,ProjectsController,IssuesController,BulletinsController,NotificationsController], providers:[RolesGuard,DepartmentsService,PositionsService,EmployeesService,MeetingsService,ProjectsService,IssuesService,BulletinsService,NotificationsService] })
export class ResourcesModule {}
