import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthUser } from '../common/types';
import { ApplyOpportunityDto, BusFactorQueryDto, CreateOpportunityDto, CreateSkillDto, OpportunityQueryDto, SkillQueryDto, TalentMatchQueryDto, UpdateApplicationStatusDto, UpdateOpportunityDto, UpdateSkillDto, UpsertEmployeeSkillDto, UpsertSkillRequirementDto } from './dto/talent.dto';
import { SkillsService, TalentIntelligenceService, TalentOpportunitiesService } from './talent.service';

@ApiTags('Skills') @ApiBearerAuth() @Controller('skills') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.EMPLOYEE)
export class SkillsController {
  constructor(private readonly service: SkillsService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: SkillQueryDto) { return this.service.list(user, query); }
  @Get('options/list') options(@CurrentUser() user: AuthUser) { return this.service.options(user); }
  @Get(':id') get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.get(user, id); }
  @Post() @Roles(Role.ADMIN) create(@CurrentUser() user: AuthUser, @Body() dto: CreateSkillDto) { return this.service.create(user, dto); }
  @Patch(':id') @Roles(Role.ADMIN) update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateSkillDto) { return this.service.update(user, id, dto); }
  @Delete(':id') @Roles(Role.ADMIN) remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.remove(user, id); }
}

@ApiTags('Talent intelligence') @ApiBearerAuth() @Controller('talent') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.EMPLOYEE)
export class TalentIntelligenceController {
  constructor(private readonly service: TalentIntelligenceService) {}
  @Get('me/skills') mySkills(@CurrentUser() user: AuthUser) { return this.service.mySkills(user); }
  @Get('bus-factor') @Roles(Role.ADMIN) busFactor(@CurrentUser() user: AuthUser, @Query() query: BusFactorQueryDto) { return this.service.busFactor(user, query); }
  @Get('employees/:employeeId/skills') employeeSkills(@CurrentUser() user: AuthUser, @Param('employeeId') employeeId: string) { return this.service.employeeSkills(user, employeeId); }
  @Put('employees/:employeeId/skills/:skillId') upsertEmployeeSkill(@CurrentUser() user: AuthUser, @Param('employeeId') employeeId: string, @Param('skillId') skillId: string, @Body() dto: UpsertEmployeeSkillDto) { return this.service.upsertEmployeeSkill(user, employeeId, skillId, dto); }
  @Delete('employees/:employeeId/skills/:skillId') removeEmployeeSkill(@CurrentUser() user: AuthUser, @Param('employeeId') employeeId: string, @Param('skillId') skillId: string) { return this.service.removeEmployeeSkill(user, employeeId, skillId); }
  @Get('employees/:employeeId/impact') @Roles(Role.ADMIN) employeeImpact(@CurrentUser() user: AuthUser, @Param('employeeId') employeeId: string) { return this.service.employeeImpact(user, employeeId); }
  @Get('employees/:employeeId/growth-plan') growthPlan(@CurrentUser() user: AuthUser, @Param('employeeId') employeeId: string) { return this.service.growthPlan(user, employeeId); }
  @Get('projects/:projectId/requirements') projectRequirements(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) { return this.service.projectRequirements(user, projectId); }
  @Put('projects/:projectId/requirements/:skillId') @Roles(Role.ADMIN) upsertProjectRequirement(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string, @Param('skillId') skillId: string, @Body() dto: UpsertSkillRequirementDto) { return this.service.upsertProjectRequirement(user, projectId, skillId, dto); }
  @Delete('projects/:projectId/requirements/:skillId') @Roles(Role.ADMIN) removeProjectRequirement(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string, @Param('skillId') skillId: string) { return this.service.removeProjectRequirement(user, projectId, skillId); }
  @Get('projects/:projectId/matches') @Roles(Role.ADMIN) projectMatches(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string, @Query() query: TalentMatchQueryDto) { return this.service.projectMatches(user, projectId, query); }
  @Get('projects/:projectId/evidence-suggestions') @Roles(Role.ADMIN) evidenceSuggestions(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) { return this.service.evidenceSuggestions(user, projectId); }
}

@ApiTags('Talent opportunities') @ApiBearerAuth() @Controller('talent-opportunities') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN, Role.EMPLOYEE)
export class TalentOpportunitiesController {
  constructor(private readonly service: TalentOpportunitiesService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: OpportunityQueryDto) { return this.service.list(user, query); }
  @Get('my-applications') @Roles(Role.EMPLOYEE) myApplications(@CurrentUser() user: AuthUser) { return this.service.myApplications(user); }
  @Patch('my-applications/:id/withdraw') @Roles(Role.EMPLOYEE) withdraw(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.withdraw(user, id); }
  @Get(':id') get(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.get(user, id); }
  @Post() @Roles(Role.ADMIN) create(@CurrentUser() user: AuthUser, @Body() dto: CreateOpportunityDto) { return this.service.create(user, dto); }
  @Patch(':id') @Roles(Role.ADMIN) update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateOpportunityDto) { return this.service.update(user, id, dto); }
  @Delete(':id') @Roles(Role.ADMIN) remove(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.remove(user, id); }
  @Put(':id/requirements/:skillId') @Roles(Role.ADMIN) upsertRequirement(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('skillId') skillId: string, @Body() dto: UpsertSkillRequirementDto) { return this.service.upsertRequirement(user, id, skillId, dto); }
  @Delete(':id/requirements/:skillId') @Roles(Role.ADMIN) removeRequirement(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('skillId') skillId: string) { return this.service.removeRequirement(user, id, skillId); }
  @Get(':id/matches') @Roles(Role.ADMIN) matches(@CurrentUser() user: AuthUser, @Param('id') id: string, @Query() query: TalentMatchQueryDto) { return this.service.matches(user, id, query); }
  @Get(':id/my-match') @Roles(Role.EMPLOYEE) myMatch(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.myMatch(user, id); }
  @Post(':id/apply') @Roles(Role.EMPLOYEE) apply(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ApplyOpportunityDto) { return this.service.apply(user, id, dto); }
  @Get(':id/applications') @Roles(Role.ADMIN) applications(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.applications(user, id); }
  @Patch(':id/applications/:applicationId') @Roles(Role.ADMIN) updateApplication(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('applicationId') applicationId: string, @Body() dto: UpdateApplicationStatusDto) { return this.service.updateApplication(user, id, applicationId, dto); }
}
