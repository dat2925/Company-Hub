import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeGoalStatus, ImpactReportStatus, ImpactVisibility, IssueStatus, Prisma, Role } from '@prisma/client';
import { pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto, CreateImpactEntryDto, CreateRecognitionDto, GenerateImpactReportDto, GoalQueryDto, ImpactEntryQueryDto, ImpactRangeQueryDto, ImpactReportQueryDto, RecognitionQueryDto, ReviewImpactReportDto, UpdateGoalDto, UpdateImpactEntryDto, UpdateImpactReportDto } from './dto/impact.dto';
import { summarizeImpact } from './impact-summary';

const employeeSelect = { id: true, employeeCode: true, fullName: true, department: { select: { id: true, name: true } }, position: { select: { id: true, name: true } } } as const;
const entryInclude = { employee: { select: employeeSelect }, project: { select: { id: true, code: true, name: true } }, sourceIssue: { select: { id: true, title: true, priority: true, status: true } } } as const;
const recognitionInclude = { sender: { select: employeeSelect }, receiver: { select: employeeSelect }, skill: { select: { id: true, code: true, name: true } } } as const;
const reportInclude = { employee: { select: employeeSelect }, reviewer: { select: { id: true, email: true } } } as const;
const paging = (query: { page: number; pageSize: number }) => ({ skip: (query.page - 1) * query.pageSize, take: query.pageSize });
const parseDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const parseEndDate = (value: string) => new Date(`${value}T23:59:59.999Z`);

function range(from?: string, to?: string) {
  const start = from ? parseDate(from) : new Date(Date.now() - 30 * 86400000);
  const end = to ? parseEndDate(to) : new Date();
  if (end < start) throw new BadRequestException('End date must be on or after start date');
  if (end.getTime() - start.getTime() > 732 * 86400000) throw new BadRequestException('Date range cannot exceed two years');
  return { start, end };
}

@Injectable()
export class ImpactService {
  constructor(private readonly prisma: PrismaService) {}

  private async currentEmployee(user: AuthUser) {
    const employee = await this.prisma.employee.findFirst({ where: { companyId: user.companyId!, userId: user.id }, select: employeeSelect });
    if (!employee) throw new ForbiddenException('Your account is not linked to an employee');
    return employee;
  }

  private async targetEmployee(user: AuthUser, requestedId?: string) {
    if (user.role === Role.EMPLOYEE) return this.currentEmployee(user);
    if (!requestedId) return this.currentEmployee(user);
    const employee = await this.prisma.employee.findFirst({ where: { id: requestedId, companyId: user.companyId! }, select: employeeSelect });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  private async ownEntry(user: AuthUser, id: string) {
    const employee = await this.currentEmployee(user);
    const entry = await this.prisma.impactEntry.findFirst({ where: { id, companyId: user.companyId!, employeeId: employee.id }, include: entryInclude });
    if (!entry) throw new NotFoundException('Impact entry not found');
    return entry;
  }

  private async validateEntryLinks(companyId: string, employeeId: string, projectId?: string, sourceIssueId?: string) {
    let resolvedProjectId = projectId;
    if (sourceIssueId) {
      const issue = await this.prisma.issue.findFirst({ where: { id: sourceIssueId, companyId, assigneeId: employeeId }, select: { id: true, projectId: true } });
      if (!issue) throw new BadRequestException('Source issue must belong to the employee');
      if (projectId && projectId !== issue.projectId) throw new BadRequestException('Project does not match the source issue');
      resolvedProjectId = issue.projectId;
    }
    if (resolvedProjectId && !await this.prisma.project.findFirst({ where: { id: resolvedProjectId, companyId }, select: { id: true } })) throw new BadRequestException('Invalid project');
    return resolvedProjectId;
  }

  async dashboard(user: AuthUser, query: ImpactRangeQueryDto) {
    const employee = await this.targetEmployee(user, query.employeeId);
    const { start, end } = range(query.from, query.to);
    const [entries, completedIssues, recognitions, goals, attendance] = await Promise.all([
      this.prisma.impactEntry.findMany({ where: { companyId: user.companyId!, employeeId: employee.id, occurredOn: { gte: start, lte: end }, ...(user.role === Role.ADMIN && { visibility: { not: ImpactVisibility.PRIVATE } }) }, include: entryInclude, orderBy: { occurredOn: 'desc' } }),
      this.prisma.issue.findMany({ where: { companyId: user.companyId!, assigneeId: employee.id, status: IssueStatus.DONE, updatedAt: { gte: start, lte: end } }, select: { id: true, title: true, priority: true, projectId: true, updatedAt: true, project: { select: { id: true, code: true, name: true } } }, orderBy: { updatedAt: 'desc' } }),
      this.prisma.recognition.findMany({ where: { companyId: user.companyId!, receiverEmployeeId: employee.id, createdAt: { gte: start, lte: end }, ...(user.role === Role.ADMIN && { visibility: { not: ImpactVisibility.PRIVATE } }) }, include: recognitionInclude, orderBy: { createdAt: 'desc' } }),
      this.prisma.employeeGoal.findMany({ where: { companyId: user.companyId!, employeeId: employee.id }, orderBy: [{ status: 'asc' }, { targetDate: 'asc' }] }),
      this.prisma.attendance.aggregate({ where: { companyId: user.companyId!, employeeId: employee.id, workDate: { gte: start, lte: end } }, _sum: { workedMinutes: true, overtimeMinutes: true } }),
    ]);
    const summary = summarizeImpact({ entries, completedIssues, recognitionCount: recognitions.length, activeGoalCount: goals.filter((goal) => goal.status === EmployeeGoalStatus.ACTIVE).length, completedGoalCount: goals.filter((goal) => goal.status === EmployeeGoalStatus.COMPLETED && goal.completedAt && goal.completedAt >= start && goal.completedAt <= end).length, workedMinutes: attendance._sum.workedMinutes ?? 0, overtimeMinutes: attendance._sum.overtimeMinutes ?? 0 });
    return { employee, period: { from: start, to: end }, summary, entries, completedIssues, recognitions, goals };
  }

  async suggestions(user: AuthUser) {
    const employee = await this.currentEmployee(user);
    const since = new Date(Date.now() - 90 * 86400000);
    const issues = await this.prisma.issue.findMany({ where: { companyId: user.companyId!, assigneeId: employee.id, status: IssueStatus.DONE, updatedAt: { gte: since }, impactEntries: { none: { employeeId: employee.id } } }, include: { project: { select: { id: true, code: true, name: true } } }, orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }], take: 20 });
    return issues.map((issue) => ({ suggestionType: 'COMPLETED_ISSUE', sourceIssueId: issue.id, projectId: issue.projectId, title: issue.title, priority: issue.priority, completedAtApproximation: issue.updatedAt, project: issue.project }));
  }

  async entries(user: AuthUser, query: ImpactEntryQueryDto) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : query.employeeId ? await this.targetEmployee(user, query.employeeId) : undefined;
    const date = query.from || query.to ? range(query.from, query.to) : undefined;
    const visibility = user.role === Role.ADMIN ? query.visibility && query.visibility !== ImpactVisibility.PRIVATE ? query.visibility : { not: ImpactVisibility.PRIVATE } : query.visibility;
    const where: Prisma.ImpactEntryWhereInput = { companyId: user.companyId!, ...(employee && { employeeId: employee.id }), ...(visibility && { visibility }), ...(date && { occurredOn: { gte: date.start, lte: date.end } }), ...(query.type && { type: query.type }), ...(query.search && { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] }) };
    const [data, total] = await this.prisma.$transaction([this.prisma.impactEntry.findMany({ where, ...paging(query), include: entryInclude, orderBy: [{ occurredOn: 'desc' }, { createdAt: 'desc' }] }), this.prisma.impactEntry.count({ where })]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async createEntry(user: AuthUser, dto: CreateImpactEntryDto) {
    const employee = await this.currentEmployee(user);
    const projectId = await this.validateEntryLinks(user.companyId!, employee.id, dto.projectId, dto.sourceIssueId);
    const { occurredOn, metrics, ...data } = dto;
    return this.prisma.impactEntry.create({ data: { ...data, projectId, occurredOn: parseDate(occurredOn), metrics: metrics as Prisma.InputJsonValue | undefined, employeeId: employee.id, companyId: user.companyId! }, include: entryInclude });
  }

  async updateEntry(user: AuthUser, id: string, dto: UpdateImpactEntryDto) {
    const current = await this.ownEntry(user, id);
    const projectId = await this.validateEntryLinks(user.companyId!, current.employeeId, dto.projectId ?? current.projectId ?? undefined, dto.sourceIssueId ?? current.sourceIssueId ?? undefined);
    const { occurredOn, metrics, ...data } = dto;
    return this.prisma.impactEntry.update({ where: { id }, data: { ...data, projectId, ...(occurredOn && { occurredOn: parseDate(occurredOn) }), ...(metrics && { metrics: metrics as Prisma.InputJsonValue }) }, include: entryInclude });
  }

  async removeEntry(user: AuthUser, id: string) { await this.ownEntry(user, id); return this.prisma.impactEntry.delete({ where: { id } }); }

  async feed(user: AuthUser, query: ImpactEntryQueryDto) {
    const date = query.from || query.to ? range(query.from, query.to) : undefined;
    const [entries, recognitions] = await Promise.all([
      this.prisma.impactEntry.findMany({ where: { companyId: user.companyId!, visibility: ImpactVisibility.COMPANY, ...(date && { occurredOn: { gte: date.start, lte: date.end } }) }, include: entryInclude, take: query.pageSize, skip: (query.page - 1) * query.pageSize, orderBy: { occurredOn: 'desc' } }),
      this.prisma.recognition.findMany({ where: { companyId: user.companyId!, visibility: ImpactVisibility.COMPANY, ...(date && { createdAt: { gte: date.start, lte: date.end } }) }, include: recognitionInclude, take: query.pageSize, skip: (query.page - 1) * query.pageSize, orderBy: { createdAt: 'desc' } }),
    ]);
    return [...entries.map((item) => ({ kind: 'IMPACT_ENTRY', occurredAt: item.occurredOn, item })), ...recognitions.map((item) => ({ kind: 'RECOGNITION', occurredAt: item.createdAt, item }))].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()).slice(0, query.pageSize);
  }

  async recognitions(user: AuthUser, query: RecognitionQueryDto) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : query.employeeId ? await this.targetEmployee(user, query.employeeId) : undefined;
    const date = query.from || query.to ? range(query.from, query.to) : undefined;
    const where: Prisma.RecognitionWhereInput = { companyId: user.companyId!, ...(employee && { receiverEmployeeId: employee.id }), ...(user.role === Role.ADMIN && { visibility: { not: ImpactVisibility.PRIVATE } }), ...(date && { createdAt: { gte: date.start, lte: date.end } }) };
    const [data, total] = await this.prisma.$transaction([this.prisma.recognition.findMany({ where, ...paging(query), include: recognitionInclude, orderBy: { createdAt: 'desc' } }), this.prisma.recognition.count({ where })]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async createRecognition(user: AuthUser, dto: CreateRecognitionDto) {
    const sender = await this.currentEmployee(user);
    if (sender.id === dto.receiverEmployeeId) throw new BadRequestException('You cannot recognize yourself');
    const receiver = await this.prisma.employee.findFirst({ where: { id: dto.receiverEmployeeId, companyId: user.companyId!, status: 'ACTIVE' }, select: { id: true } });
    if (!receiver) throw new BadRequestException('Invalid recipient');
    if (dto.skillId && !await this.prisma.skill.findFirst({ where: { id: dto.skillId, companyId: user.companyId!, isActive: true }, select: { id: true } })) throw new BadRequestException('Invalid skill');
    return this.prisma.recognition.create({ data: { ...dto, senderEmployeeId: sender.id, companyId: user.companyId! }, include: recognitionInclude });
  }

  async removeRecognition(user: AuthUser, id: string) {
    const sender = user.role === Role.ADMIN ? undefined : await this.currentEmployee(user);
    const row = await this.prisma.recognition.findFirst({ where: { id, companyId: user.companyId!, ...(sender && { senderEmployeeId: sender.id }) }, select: { id: true } });
    if (!row) throw new NotFoundException('Recognition not found');
    return this.prisma.recognition.delete({ where: { id } });
  }

  async goals(user: AuthUser, query: GoalQueryDto) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : query.employeeId ? await this.targetEmployee(user, query.employeeId) : undefined;
    const where: Prisma.EmployeeGoalWhereInput = { companyId: user.companyId!, ...(employee && { employeeId: employee.id }), ...(query.status && { status: query.status }), ...(query.search && { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] }) };
    const [data, total] = await this.prisma.$transaction([this.prisma.employeeGoal.findMany({ where, ...paging(query), include: { employee: { select: employeeSelect } }, orderBy: [{ status: 'asc' }, { targetDate: 'asc' }] }), this.prisma.employeeGoal.count({ where })]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async createGoal(user: AuthUser, dto: CreateGoalDto) {
    const employee = await this.targetEmployee(user, dto.employeeId);
    const startDate = parseDate(dto.startDate), targetDate = dto.targetDate ? parseDate(dto.targetDate) : undefined;
    if (targetDate && targetDate < startDate) throw new BadRequestException('Target date must be on or after start date');
    const data = { ...dto };
    delete data.employeeId;
    const status = data.status ?? (data.progress === 100 ? EmployeeGoalStatus.COMPLETED : EmployeeGoalStatus.ACTIVE);
    return this.prisma.employeeGoal.create({ data: { ...data, startDate, targetDate, status, progress: status === EmployeeGoalStatus.COMPLETED ? 100 : data.progress ?? 0, completedAt: status === EmployeeGoalStatus.COMPLETED ? new Date() : undefined, employeeId: employee.id, companyId: user.companyId! }, include: { employee: { select: employeeSelect } } });
  }

  private async editableGoal(user: AuthUser, id: string) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : undefined;
    const row = await this.prisma.employeeGoal.findFirst({ where: { id, companyId: user.companyId!, ...(employee && { employeeId: employee.id }) } });
    if (!row) throw new NotFoundException('Goal not found');
    return row;
  }

  async updateGoal(user: AuthUser, id: string, dto: UpdateGoalDto) {
    const current = await this.editableGoal(user, id);
    if (dto.employeeId && dto.employeeId !== current.employeeId) throw new BadRequestException('A goal cannot be moved to another employee');
    const startDate = dto.startDate ? parseDate(dto.startDate) : current.startDate;
    const targetDate = dto.targetDate ? parseDate(dto.targetDate) : current.targetDate;
    if (targetDate && targetDate < startDate) throw new BadRequestException('Target date must be on or after start date');
    const data = { ...dto };
    delete data.employeeId;
    const status = data.status ?? (data.progress === 100 ? EmployeeGoalStatus.COMPLETED : current.status);
    return this.prisma.employeeGoal.update({ where: { id }, data: { ...data, startDate, targetDate, status, ...(status === EmployeeGoalStatus.COMPLETED ? { progress: 100, completedAt: current.completedAt ?? new Date() } : current.status === EmployeeGoalStatus.COMPLETED ? { completedAt: null } : {}) }, include: { employee: { select: employeeSelect } } });
  }

  async removeGoal(user: AuthUser, id: string) { await this.editableGoal(user, id); return this.prisma.employeeGoal.delete({ where: { id } }); }

  async generateReport(user: AuthUser, dto: GenerateImpactReportDto) {
    const employee = await this.currentEmployee(user);
    const periodStart = parseDate(dto.periodStart), periodEnd = parseDate(dto.periodEnd);
    range(dto.periodStart, dto.periodEnd);
    const dashboard = await this.dashboard(user, { from: dto.periodStart, to: dto.periodEnd, employeeId: employee.id });
    const entries = dashboard.entries.filter((entry) => entry.visibility !== ImpactVisibility.PRIVATE);
    const recognitions = dashboard.recognitions.filter((recognition) => recognition.visibility !== ImpactVisibility.PRIVATE);
    const summary = summarizeImpact({
      entries,
      completedIssues: dashboard.completedIssues,
      recognitionCount: recognitions.length,
      activeGoalCount: dashboard.goals.filter((goal) => goal.status === EmployeeGoalStatus.ACTIVE).length,
      completedGoalCount: dashboard.goals.filter((goal) => goal.status === EmployeeGoalStatus.COMPLETED && goal.completedAt && goal.completedAt >= periodStart && goal.completedAt <= parseEndDate(dto.periodEnd)).length,
      workedMinutes: dashboard.summary.workedMinutes,
      overtimeMinutes: dashboard.summary.overtimeMinutes,
    });
    const snapshot = JSON.parse(JSON.stringify({ generatedAt: new Date(), summary, entries, completedIssues: dashboard.completedIssues, recognitions, goals: dashboard.goals })) as Prisma.InputJsonValue;
    return this.prisma.impactReport.create({ data: { companyId: user.companyId!, employeeId: employee.id, period: dto.period, periodStart, periodEnd, selfReflection: dto.selfReflection, snapshot }, include: reportInclude });
  }

  async reports(user: AuthUser, query: ImpactReportQueryDto) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : query.employeeId ? await this.targetEmployee(user, query.employeeId) : undefined;
    const adminStatus = query.status && query.status !== ImpactReportStatus.DRAFT ? query.status : { in: [ImpactReportStatus.SUBMITTED, ImpactReportStatus.REVIEWED] };
    const where: Prisma.ImpactReportWhereInput = { companyId: user.companyId!, ...(employee && { employeeId: employee.id }), ...(user.role === Role.ADMIN && { status: adminStatus }), ...(user.role === Role.EMPLOYEE && query.status && { status: query.status }) };
    const [data, total] = await this.prisma.$transaction([this.prisma.impactReport.findMany({ where, ...paging(query), include: reportInclude, orderBy: { periodEnd: 'desc' } }), this.prisma.impactReport.count({ where })]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async getReport(user: AuthUser, id: string) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : undefined;
    const row = await this.prisma.impactReport.findFirst({ where: { id, companyId: user.companyId!, ...(employee ? { employeeId: employee.id } : { status: { in: [ImpactReportStatus.SUBMITTED, ImpactReportStatus.REVIEWED] } }) }, include: reportInclude });
    if (!row) throw new NotFoundException('Impact report not found');
    return row;
  }

  async updateReport(user: AuthUser, id: string, dto: UpdateImpactReportDto) {
    const report = await this.getReport(user, id);
    if (report.status !== ImpactReportStatus.DRAFT) throw new ConflictException('Only draft reports can be edited');
    return this.prisma.impactReport.update({ where: { id }, data: dto, include: reportInclude });
  }

  async submitReport(user: AuthUser, id: string) {
    const report = await this.getReport(user, id);
    if (report.status !== ImpactReportStatus.DRAFT) throw new ConflictException('Only draft reports can be submitted');
    return this.prisma.impactReport.update({ where: { id }, data: { status: ImpactReportStatus.SUBMITTED, submittedAt: new Date() }, include: reportInclude });
  }

  async reviewReport(user: AuthUser, id: string, dto: ReviewImpactReportDto) {
    const report = await this.getReport(user, id);
    if (report.status !== ImpactReportStatus.SUBMITTED) throw new ConflictException('Only submitted reports can be reviewed');
    return this.prisma.impactReport.update({ where: { id }, data: { status: ImpactReportStatus.REVIEWED, managerComment: dto.managerComment, reviewerId: user.id, reviewedAt: new Date() }, include: reportInclude });
  }
}
