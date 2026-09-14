import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { IssueStatus, OpportunityApplicationStatus, Prisma, Role, SkillSource, TalentOpportunityStatus } from '@prisma/client';
import { pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyOpportunityDto, BusFactorQueryDto, CreateOpportunityDto, CreateSkillDto, OpportunityQueryDto, SkillQueryDto, TalentMatchQueryDto, UpdateApplicationStatusDto, UpdateOpportunityDto, UpdateSkillDto, UpsertEmployeeSkillDto, UpsertSkillRequirementDto } from './dto/talent.dto';
import { calculateAvailability, RequirementInput, scoreTalentMatch } from './talent-scoring';

const employeeSelect = { id: true, employeeCode: true, fullName: true, department: { select: { id: true, name: true } }, position: { select: { id: true, name: true } } } as const;
const skillSelect = { id: true, code: true, name: true, category: true, isActive: true } as const;
const requirementInclude = { skill: { select: skillSelect } } as const;
const opportunityInclude = { project: { select: { id: true, code: true, name: true } }, requirements: { include: requirementInclude }, _count: { select: { applications: true } } } as const;
const paging = (query: { page: number; pageSize: number }) => ({ skip: (query.page - 1) * query.pageSize, take: query.pageSize });
const dateOnly = (value?: string) => value ? new Date(`${value}T00:00:00.000Z`) : undefined;

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: SkillQueryDto) {
    const where: Prisma.SkillWhereInput = { companyId: user.companyId!, ...(query.category && { category: query.category }), ...(query.isActive !== undefined && { isActive: query.isActive }), ...(query.search && { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { code: { contains: query.search, mode: 'insensitive' } }, { category: { contains: query.search, mode: 'insensitive' } }] }) };
    const [data, total] = await this.prisma.$transaction([this.prisma.skill.findMany({ where, ...paging(query), orderBy: [{ category: 'asc' }, { name: 'asc' }] }), this.prisma.skill.count({ where })]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  options(user: AuthUser) { return this.prisma.skill.findMany({ where: { companyId: user.companyId!, isActive: true }, select: skillSelect, orderBy: [{ category: 'asc' }, { name: 'asc' }] }); }

  async get(user: AuthUser, id: string) {
    const row = await this.prisma.skill.findFirst({ where: { id, companyId: user.companyId! } });
    if (!row) throw new NotFoundException('Skill not found');
    return row;
  }

  async create(user: AuthUser, dto: CreateSkillDto) {
    const code = dto.code.trim().toUpperCase();
    if (await this.prisma.skill.findUnique({ where: { companyId_code: { companyId: user.companyId!, code } }, select: { id: true } })) throw new ConflictException('Skill code already exists');
    return this.prisma.skill.create({ data: { ...dto, code, companyId: user.companyId! } });
  }

  async update(user: AuthUser, id: string, dto: UpdateSkillDto) {
    await this.get(user, id);
    const code = dto.code?.trim().toUpperCase();
    if (code) {
      const duplicate = await this.prisma.skill.findUnique({ where: { companyId_code: { companyId: user.companyId!, code } }, select: { id: true } });
      if (duplicate && duplicate.id !== id) throw new ConflictException('Skill code already exists');
    }
    return this.prisma.skill.update({ where: { id }, data: { ...dto, code } });
  }

  async remove(user: AuthUser, id: string) {
    await this.get(user, id);
    const [employees, projects, opportunities] = await Promise.all([this.prisma.employeeSkill.count({ where: { skillId: id } }), this.prisma.projectSkillRequirement.count({ where: { skillId: id } }), this.prisma.opportunitySkillRequirement.count({ where: { skillId: id } })]);
    if (employees || projects || opportunities) throw new ConflictException('Skill is in use and cannot be deleted; deactivate it instead');
    return this.prisma.skill.delete({ where: { id } });
  }
}

@Injectable()
export class TalentIntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  private async currentEmployee(user: AuthUser) {
    const employee = await this.prisma.employee.findFirst({ where: { companyId: user.companyId!, userId: user.id }, select: { id: true } });
    if (!employee) throw new ForbiddenException('Your account is not linked to an employee');
    return employee;
  }

  private async assertEmployeeAccess(user: AuthUser, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId: user.companyId! }, select: employeeSelect });
    if (!employee) throw new NotFoundException('Employee not found');
    if (user.role === Role.EMPLOYEE && employeeId !== (await this.currentEmployee(user)).id) throw new ForbiddenException();
    return employee;
  }

  private async assertSkill(companyId: string, skillId: string) {
    const skill = await this.prisma.skill.findFirst({ where: { id: skillId, companyId } });
    if (!skill) throw new BadRequestException('Invalid skill');
    return skill;
  }

  private async assertProject(companyId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, companyId }, select: { id: true, code: true, name: true, status: true } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async mySkills(user: AuthUser) { return this.employeeSkills(user, (await this.currentEmployee(user)).id); }

  async employeeSkills(user: AuthUser, employeeId: string) {
    const employee = await this.assertEmployeeAccess(user, employeeId);
    const skills = await this.prisma.employeeSkill.findMany({ where: { companyId: user.companyId!, employeeId }, include: { skill: { select: skillSelect } }, orderBy: [{ level: 'desc' }, { skill: { name: 'asc' } }] });
    return { employee, skills };
  }

  async upsertEmployeeSkill(user: AuthUser, employeeId: string, skillId: string, dto: UpsertEmployeeSkillDto) {
    await this.assertEmployeeAccess(user, employeeId);
    await this.assertSkill(user.companyId!, skillId);
    const isAdmin = user.role === Role.ADMIN;
    const existing = await this.prisma.employeeSkill.findUnique({ where: { employeeId_skillId: { employeeId, skillId } }, select: { source: true } });
    if (!isAdmin && existing && existing.source !== SkillSource.SELF_DECLARED) throw new ForbiddenException('A verified skill can only be changed by an administrator');
    const source = isAdmin ? dto.source ?? SkillSource.MANAGER_VERIFIED : SkillSource.SELF_DECLARED;
    const data = { level: dto.level, yearsExperience: dto.yearsExperience ?? 0, source, evidence: dto.evidence, lastUsedAt: dto.lastUsedAt ? new Date(dto.lastUsedAt) : undefined, verifiedAt: source === SkillSource.SELF_DECLARED ? null : new Date() };
    return this.prisma.employeeSkill.upsert({ where: { employeeId_skillId: { employeeId, skillId } }, create: { ...data, companyId: user.companyId!, employeeId, skillId }, update: data, include: { skill: { select: skillSelect }, employee: { select: employeeSelect } } });
  }

  async removeEmployeeSkill(user: AuthUser, employeeId: string, skillId: string) {
    await this.assertEmployeeAccess(user, employeeId);
    const row = await this.prisma.employeeSkill.findFirst({ where: { companyId: user.companyId!, employeeId, skillId }, select: { id: true, source: true } });
    if (!row) throw new NotFoundException('Employee skill not found');
    if (user.role === Role.EMPLOYEE && row.source !== SkillSource.SELF_DECLARED) throw new ForbiddenException('A verified skill can only be removed by an administrator');
    return this.prisma.employeeSkill.delete({ where: { id: row.id } });
  }

  async projectRequirements(user: AuthUser, projectId: string) {
    const project = await this.assertProject(user.companyId!, projectId);
    const requirements = await this.prisma.projectSkillRequirement.findMany({ where: { companyId: user.companyId!, projectId }, include: requirementInclude, orderBy: [{ weight: 'desc' }, { skill: { name: 'asc' } }] });
    return { project, requirements };
  }

  async upsertProjectRequirement(user: AuthUser, projectId: string, skillId: string, dto: UpsertSkillRequirementDto) {
    await Promise.all([this.assertProject(user.companyId!, projectId), this.assertSkill(user.companyId!, skillId)]);
    const data = { minimumLevel: dto.minimumLevel ?? 1, weight: dto.weight ?? 1, isRequired: dto.isRequired ?? true };
    return this.prisma.projectSkillRequirement.upsert({ where: { projectId_skillId: { projectId, skillId } }, create: { ...data, companyId: user.companyId!, projectId, skillId }, update: data, include: requirementInclude });
  }

  async removeProjectRequirement(user: AuthUser, projectId: string, skillId: string) {
    await this.assertProject(user.companyId!, projectId);
    const row = await this.prisma.projectSkillRequirement.findFirst({ where: { companyId: user.companyId!, projectId, skillId }, select: { id: true } });
    if (!row) throw new NotFoundException('Project skill requirement not found');
    return this.prisma.projectSkillRequirement.delete({ where: { id: row.id } });
  }

  async rankCandidates(companyId: string, requirements: RequirementInput[], limit: number, employeeId?: string) {
    if (!requirements.length) throw new BadRequestException('At least one skill requirement is needed for matching');
    const since = new Date(Date.now() - 30 * 86400000);
    const [employees, issueCounts, overtime] = await Promise.all([
      this.prisma.employee.findMany({ where: { companyId, status: 'ACTIVE', ...(employeeId && { id: employeeId }) }, select: { ...employeeSelect, skills: { select: { skillId: true, level: true, yearsExperience: true, source: true, skill: { select: skillSelect } } } } }),
      this.prisma.issue.groupBy({ by: ['assigneeId'], where: { companyId, assigneeId: employeeId ?? { not: null }, status: { in: [IssueStatus.OPEN, IssueStatus.IN_PROGRESS] } }, _count: true }),
      this.prisma.attendance.groupBy({ by: ['employeeId'], where: { companyId, ...(employeeId && { employeeId }), workDate: { gte: since } }, _sum: { overtimeMinutes: true } }),
    ]);
    const issuesByEmployee = new Map(issueCounts.map((row) => [row.assigneeId, row._count]));
    const overtimeByEmployee = new Map(overtime.map((row) => [row.employeeId, row._sum.overtimeMinutes ?? 0]));
    return employees.map((employee) => {
      const openIssueCount = issuesByEmployee.get(employee.id) ?? 0;
      const overtimeMinutes30Days = overtimeByEmployee.get(employee.id) ?? 0;
      const availabilityScore = calculateAvailability(openIssueCount, overtimeMinutes30Days);
      return { employee, ...scoreTalentMatch(requirements, employee.skills, availabilityScore), workload: { openIssueCount, overtimeMinutes30Days } };
    }).sort((a, b) => b.matchScore - a.matchScore || b.skillFitScore - a.skillFitScore || a.employee.fullName.localeCompare(b.employee.fullName)).slice(0, limit);
  }

  async projectMatches(user: AuthUser, projectId: string, query: TalentMatchQueryDto) {
    const { project, requirements } = await this.projectRequirements(user, projectId);
    return { project, requirements, candidates: await this.rankCandidates(user.companyId!, requirements, query.limit) };
  }

  async busFactor(user: AuthUser, query: BusFactorQueryDto) {
    const skills = await this.prisma.skill.findMany({ where: { companyId: user.companyId!, isActive: true }, include: { employeeSkills: { where: { level: { gte: query.minimumLevel }, employee: { status: 'ACTIVE' } }, select: { level: true, source: true, employee: { select: employeeSelect } }, orderBy: { level: 'desc' } }, projectRequirements: { where: { project: { status: { in: ['PLANNING', 'ACTIVE'] } } }, select: { project: { select: { id: true, code: true, name: true } }, minimumLevel: true, isRequired: true } }, opportunityRequirements: { where: { opportunity: { status: TalentOpportunityStatus.OPEN } }, select: { opportunity: { select: { id: true, title: true, type: true } }, minimumLevel: true, isRequired: true } } } });
    const criticalSkills = skills.filter((skill) => skill.employeeSkills.length <= query.maxHolders && (skill.projectRequirements.length > 0 || skill.opportunityRequirements.length > 0)).map((skill) => ({ skill: { id: skill.id, code: skill.code, name: skill.name, category: skill.category }, qualifiedHolderCount: skill.employeeSkills.length, holders: skill.employeeSkills, affectedProjects: skill.projectRequirements, affectedOpportunities: skill.opportunityRequirements, severity: skill.employeeSkills.length === 0 ? 'CRITICAL' : 'HIGH' }));
    return { minimumLevel: query.minimumLevel, maxHolders: query.maxHolders, criticalSkillCount: criticalSkills.length, criticalSkills };
  }

  async employeeImpact(user: AuthUser, employeeId: string) {
    const employee = await this.assertEmployeeAccess(user, employeeId);
    const [skills, openIssues] = await Promise.all([
      this.prisma.employeeSkill.findMany({
        where: { companyId: user.companyId!, employeeId, level: { gte: 3 } },
        include: {
          skill: {
            include: {
              employeeSkills: {
                where: { employeeId: { not: employeeId }, employee: { status: 'ACTIVE' } },
                select: { level: true, employee: { select: employeeSelect } },
                orderBy: { level: 'desc' },
              },
              projectRequirements: {
                where: { project: { status: { in: ['PLANNING', 'ACTIVE'] } } },
                select: { minimumLevel: true, isRequired: true, project: { select: { id: true, code: true, name: true } } },
              },
            },
          },
        },
      }),
      this.prisma.issue.findMany({ where: { companyId: user.companyId!, assigneeId: employeeId, status: { in: [IssueStatus.OPEN, IssueStatus.IN_PROGRESS] } }, select: { id: true, title: true, priority: true, status: true, project: { select: { id: true, code: true, name: true } } }, orderBy: { dueDate: 'asc' } }),
    ]);
    const skillRisks = skills.map((item) => { const replacements = item.skill.employeeSkills.filter((candidate) => candidate.level >= item.level); return { skill: { id: item.skill.id, code: item.skill.code, name: item.skill.name }, departingLevel: item.level, replacements, affectedProjects: item.skill.projectRequirements, severity: replacements.length === 0 ? 'CRITICAL' : replacements.length === 1 ? 'HIGH' : 'LOW' }; });
    const criticalCount = skillRisks.filter((item) => item.severity === 'CRITICAL').length;
    return { employee, overallRisk: criticalCount ? 'CRITICAL' : skillRisks.some((item) => item.severity === 'HIGH') || openIssues.length >= 5 ? 'HIGH' : openIssues.length ? 'MEDIUM' : 'LOW', openIssues, skillRisks, recommendedActions: ['ASSIGN_SKILL_BACKUPS', 'TRANSFER_OPEN_ISSUES', 'CREATE_KNOWLEDGE_TRANSFER_PLAN'].filter((_, index) => index === 0 ? criticalCount > 0 : index === 1 ? openIssues.length > 0 : skillRisks.length > 0) };
  }

  async growthPlan(user: AuthUser, employeeId: string) {
    const employee = await this.assertEmployeeAccess(user, employeeId);
    const [owned, projectRequirements, opportunityRequirements] = await Promise.all([
      this.prisma.employeeSkill.findMany({ where: { companyId: user.companyId!, employeeId }, select: { skillId: true, level: true } }),
      this.prisma.projectSkillRequirement.findMany({ where: { companyId: user.companyId!, project: { status: { in: ['PLANNING', 'ACTIVE'] } } }, include: { skill: { select: skillSelect }, project: { select: { id: true, code: true, name: true } } } }),
      this.prisma.opportunitySkillRequirement.findMany({ where: { companyId: user.companyId!, opportunity: { status: TalentOpportunityStatus.OPEN } }, include: { skill: { select: skillSelect }, opportunity: { select: { id: true, title: true, type: true } } } }),
    ]);
    const levels = new Map(owned.map((item) => [item.skillId, item.level]));
    const demand = [...projectRequirements.map((item) => ({ ...item, demandType: 'PROJECT' as const, source: item.project })), ...opportunityRequirements.map((item) => ({ ...item, demandType: 'OPPORTUNITY' as const, source: item.opportunity }))];
    const gaps = demand.filter((item) => (levels.get(item.skillId) ?? 0) < item.minimumLevel).map((item) => ({ skill: item.skill, currentLevel: levels.get(item.skillId) ?? 0, targetLevel: item.minimumLevel, gap: item.minimumLevel - (levels.get(item.skillId) ?? 0), weight: item.weight, isRequired: item.isRequired, demandType: item.demandType, source: item.source })).sort((a, b) => b.gap - a.gap || b.weight - a.weight);
    return { employee, skillCount: owned.length, gapCount: gaps.length, priorityGaps: gaps.slice(0, 10) };
  }

  async evidenceSuggestions(user: AuthUser, projectId: string) {
    const { project, requirements } = await this.projectRequirements(user, projectId);
    const completed = await this.prisma.issue.findMany({ where: { companyId: user.companyId!, projectId, status: IssueStatus.DONE, assigneeId: { not: null } }, select: { assigneeId: true, assignee: { select: employeeSelect } } });
    const counts = new Map<string, { employee: NonNullable<(typeof completed)[number]['assignee']>; completedIssueCount: number }>();
    for (const issue of completed) if (issue.assignee) { const current = counts.get(issue.assignee.id); counts.set(issue.assignee.id, { employee: issue.assignee, completedIssueCount: (current?.completedIssueCount ?? 0) + 1 }); }
    const employeeIds = [...counts.keys()];
    const existing = employeeIds.length ? await this.prisma.employeeSkill.findMany({ where: { companyId: user.companyId!, employeeId: { in: employeeIds }, skillId: { in: requirements.map((item) => item.skillId) } } }) : [];
    const existingLevels = new Map(existing.map((item) => [`${item.employeeId}:${item.skillId}`, item.level]));
    return { project, suggestions: [...counts.values()].map((entry) => ({ ...entry, suggestedSkills: requirements.filter((requirement) => (existingLevels.get(`${entry.employee.id}:${requirement.skillId}`) ?? 0) < requirement.minimumLevel).map((requirement) => ({ skill: requirement.skill, suggestedLevel: requirement.minimumLevel, evidence: `${entry.completedIssueCount} completed issue(s) in ${project.name}` })) })).filter((entry) => entry.suggestedSkills.length > 0) };
  }
}

@Injectable()
export class TalentOpportunitiesService {
  constructor(private readonly prisma: PrismaService, private readonly intelligence: TalentIntelligenceService) {}

  private async currentEmployee(user: AuthUser) {
    const employee = await this.prisma.employee.findFirst({ where: { companyId: user.companyId!, userId: user.id }, select: { id: true } });
    if (!employee) throw new ForbiddenException('Your account is not linked to an employee');
    return employee;
  }

  async list(user: AuthUser, query: OpportunityQueryDto) {
    const visibleStatus = user.role === Role.EMPLOYEE ? TalentOpportunityStatus.OPEN : query.status;
    const where: Prisma.TalentOpportunityWhereInput = { companyId: user.companyId!, ...(visibleStatus && { status: visibleStatus }), ...(query.type && { type: query.type }), ...(query.search && { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] }) };
    const [data, total] = await this.prisma.$transaction([this.prisma.talentOpportunity.findMany({ where, ...paging(query), include: opportunityInclude, orderBy: [{ status: 'asc' }, { startDate: 'asc' }, { createdAt: 'desc' }] }), this.prisma.talentOpportunity.count({ where })]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async get(user: AuthUser, id: string) {
    const row = await this.prisma.talentOpportunity.findFirst({ where: { id, companyId: user.companyId!, ...(user.role === Role.EMPLOYEE && { status: TalentOpportunityStatus.OPEN }) }, include: opportunityInclude });
    if (!row) throw new NotFoundException('Talent opportunity not found');
    return row;
  }

  private async assertProject(companyId: string, projectId?: string) {
    if (!projectId) return;
    if (!await this.prisma.project.findFirst({ where: { id: projectId, companyId }, select: { id: true } })) throw new BadRequestException('Invalid project');
  }

  private opportunityData(dto: CreateOpportunityDto | UpdateOpportunityDto) {
    const startDate = dateOnly(dto.startDate), endDate = dateOnly(dto.endDate);
    if (startDate && endDate && endDate < startDate) throw new BadRequestException('End date must be on or after start date');
    return { ...dto, startDate, endDate };
  }

  async create(user: AuthUser, dto: CreateOpportunityDto) {
    await this.assertProject(user.companyId!, dto.projectId);
    const { startDate, endDate, ...data } = dto;
    const parsedStartDate = dateOnly(startDate), parsedEndDate = dateOnly(endDate);
    if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) throw new BadRequestException('End date must be on or after start date');
    return this.prisma.talentOpportunity.create({ data: { ...data, startDate: parsedStartDate, endDate: parsedEndDate, companyId: user.companyId!, createdById: user.id }, include: opportunityInclude });
  }

  async update(user: AuthUser, id: string, dto: UpdateOpportunityDto) {
    const current = await this.get(user, id);
    await this.assertProject(user.companyId!, dto.projectId);
    const merged = { ...dto, startDate: dto.startDate ?? current.startDate?.toISOString().slice(0, 10), endDate: dto.endDate ?? current.endDate?.toISOString().slice(0, 10) };
    return this.prisma.talentOpportunity.update({ where: { id }, data: this.opportunityData(merged), include: opportunityInclude });
  }

  async remove(user: AuthUser, id: string) {
    await this.get(user, id);
    const applications = await this.prisma.opportunityApplication.count({ where: { opportunityId: id } });
    if (applications) throw new ConflictException('Opportunity has applications and cannot be deleted; close or cancel it instead');
    return this.prisma.talentOpportunity.delete({ where: { id } });
  }

  async upsertRequirement(user: AuthUser, id: string, skillId: string, dto: UpsertSkillRequirementDto) {
    await this.get(user, id);
    if (!await this.prisma.skill.findFirst({ where: { id: skillId, companyId: user.companyId! }, select: { id: true } })) throw new BadRequestException('Invalid skill');
    const data = { minimumLevel: dto.minimumLevel ?? 1, weight: dto.weight ?? 1, isRequired: dto.isRequired ?? true };
    return this.prisma.opportunitySkillRequirement.upsert({ where: { opportunityId_skillId: { opportunityId: id, skillId } }, create: { ...data, companyId: user.companyId!, opportunityId: id, skillId }, update: data, include: requirementInclude });
  }

  async removeRequirement(user: AuthUser, id: string, skillId: string) {
    await this.get(user, id);
    const row = await this.prisma.opportunitySkillRequirement.findFirst({ where: { companyId: user.companyId!, opportunityId: id, skillId }, select: { id: true } });
    if (!row) throw new NotFoundException('Opportunity skill requirement not found');
    return this.prisma.opportunitySkillRequirement.delete({ where: { id: row.id } });
  }

  async matches(user: AuthUser, id: string, query: TalentMatchQueryDto) {
    const opportunity = await this.get(user, id);
    return { opportunity, candidates: await this.intelligence.rankCandidates(user.companyId!, opportunity.requirements, query.limit) };
  }

  async myMatch(user: AuthUser, id: string) {
    const opportunity = await this.get(user, id);
    const employee = await this.currentEmployee(user);
    const [match] = await this.intelligence.rankCandidates(user.companyId!, opportunity.requirements, 1, employee.id);
    return { opportunity, match };
  }

  async apply(user: AuthUser, id: string, dto: ApplyOpportunityDto) {
    const opportunity = await this.get(user, id);
    if (opportunity.status !== TalentOpportunityStatus.OPEN) throw new ConflictException('Opportunity is not open');
    const employee = await this.currentEmployee(user);
    if (await this.prisma.opportunityApplication.findUnique({ where: { opportunityId_employeeId: { opportunityId: id, employeeId: employee.id } }, select: { id: true } })) throw new ConflictException('You already applied to this opportunity');
    return this.prisma.opportunityApplication.create({ data: { companyId: user.companyId!, opportunityId: id, employeeId: employee.id, message: dto.message }, include: { opportunity: { include: opportunityInclude }, employee: { select: employeeSelect } } });
  }

  async myApplications(user: AuthUser) {
    const employee = await this.currentEmployee(user);
    return this.prisma.opportunityApplication.findMany({ where: { companyId: user.companyId!, employeeId: employee.id }, include: { opportunity: { include: opportunityInclude } }, orderBy: { createdAt: 'desc' } });
  }

  async applications(user: AuthUser, id: string) {
    await this.get(user, id);
    return this.prisma.opportunityApplication.findMany({ where: { companyId: user.companyId!, opportunityId: id }, include: { employee: { select: employeeSelect } }, orderBy: { createdAt: 'desc' } });
  }

  async updateApplication(user: AuthUser, id: string, applicationId: string, dto: UpdateApplicationStatusDto) {
    await this.get(user, id);
    const row = await this.prisma.opportunityApplication.findFirst({ where: { id: applicationId, opportunityId: id, companyId: user.companyId! }, select: { id: true } });
    if (!row) throw new NotFoundException('Application not found');
    return this.prisma.opportunityApplication.update({ where: { id: applicationId }, data: { status: dto.status }, include: { employee: { select: employeeSelect } } });
  }

  async withdraw(user: AuthUser, id: string) {
    const employee = await this.currentEmployee(user);
    const row = await this.prisma.opportunityApplication.findFirst({ where: { id, companyId: user.companyId!, employeeId: employee.id } });
    if (!row) throw new NotFoundException('Application not found');
    if (row.status !== OpportunityApplicationStatus.PENDING && row.status !== OpportunityApplicationStatus.SHORTLISTED) throw new ConflictException('This application can no longer be withdrawn');
    return this.prisma.opportunityApplication.update({ where: { id }, data: { status: OpportunityApplicationStatus.WITHDRAWN } });
  }
}
