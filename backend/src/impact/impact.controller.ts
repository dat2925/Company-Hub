import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthUser } from '../common/types';
import { CreateGoalDto, CreateImpactEntryDto, CreateRecognitionDto, GenerateImpactReportDto, GoalQueryDto, ImpactEntryQueryDto, ImpactRangeQueryDto, ImpactReportQueryDto, RecognitionQueryDto, ReviewImpactReportDto, UpdateGoalDto, UpdateImpactEntryDto, UpdateImpactReportDto } from './dto/impact.dto';
import { ImpactService } from './impact.service';

@ApiTags('Employee impact') @ApiBearerAuth() @Controller('impact') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.EMPLOYEE)
export class ImpactController {
  constructor(private readonly service: ImpactService) {}

  @Get('dashboard') dashboard(@CurrentUser() user: AuthUser, @Query() query: ImpactRangeQueryDto) { return this.service.dashboard(user, query); }
  @Get('suggestions') @Roles(Role.EMPLOYEE) suggestions(@CurrentUser() user: AuthUser) { return this.service.suggestions(user); }
  @Get('feed') feed(@CurrentUser() user: AuthUser, @Query() query: ImpactEntryQueryDto) { return this.service.feed(user, query); }

  @Get('entries') entries(@CurrentUser() user: AuthUser, @Query() query: ImpactEntryQueryDto) { return this.service.entries(user, query); }
  @Post('entries') createEntry(@CurrentUser() user: AuthUser, @Body() dto: CreateImpactEntryDto) { return this.service.createEntry(user, dto); }
  @Patch('entries/:id') updateEntry(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateImpactEntryDto) { return this.service.updateEntry(user, id, dto); }
  @Delete('entries/:id') removeEntry(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.removeEntry(user, id); }

  @Get('recognitions') recognitions(@CurrentUser() user: AuthUser, @Query() query: RecognitionQueryDto) { return this.service.recognitions(user, query); }
  @Post('recognitions') createRecognition(@CurrentUser() user: AuthUser, @Body() dto: CreateRecognitionDto) { return this.service.createRecognition(user, dto); }
  @Delete('recognitions/:id') removeRecognition(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.removeRecognition(user, id); }

  @Get('goals') goals(@CurrentUser() user: AuthUser, @Query() query: GoalQueryDto) { return this.service.goals(user, query); }
  @Post('goals') createGoal(@CurrentUser() user: AuthUser, @Body() dto: CreateGoalDto) { return this.service.createGoal(user, dto); }
  @Patch('goals/:id') updateGoal(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateGoalDto) { return this.service.updateGoal(user, id, dto); }
  @Delete('goals/:id') removeGoal(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.removeGoal(user, id); }

  @Get('reports') reports(@CurrentUser() user: AuthUser, @Query() query: ImpactReportQueryDto) { return this.service.reports(user, query); }
  @Post('reports/generate') @Roles(Role.EMPLOYEE) generateReport(@CurrentUser() user: AuthUser, @Body() dto: GenerateImpactReportDto) { return this.service.generateReport(user, dto); }
  @Get('reports/:id') getReport(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.getReport(user, id); }
  @Patch('reports/:id') @Roles(Role.EMPLOYEE) updateReport(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateImpactReportDto) { return this.service.updateReport(user, id, dto); }
  @Post('reports/:id/submit') @Roles(Role.EMPLOYEE) submitReport(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.submitReport(user, id); }
  @Patch('reports/:id/review') @Roles(Role.ADMIN) reviewReport(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ReviewImpactReportDto) { return this.service.reviewReport(user, id, dto); }
}
