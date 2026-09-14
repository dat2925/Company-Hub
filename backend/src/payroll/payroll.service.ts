import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus, PayrollStatus, Prisma, Role } from '@prisma/client';
import { PaginationDto, pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CalculatePayrollDto, PayrollQueryDto, UpsertSalaryProfileDto } from './dto/payroll.dto';

const employeeSelect = { id: true, employeeCode: true, fullName: true } as const;

function parseMonth(value: string) {
  const [year, month] = value.split('-').map(Number);
  return { year, month, start: new Date(Date.UTC(year, month - 1, 1)), end: new Date(Date.UTC(year, month, 1)) };
}

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  private async currentEmployee(user: AuthUser) {
    const employee = await this.prisma.employee.findFirst({ where: { companyId: user.companyId!, userId: user.id }, select: employeeSelect });
    if (!employee) throw new ForbiddenException('Your account is not linked to an employee');
    return employee;
  }

  private async assertEmployee(companyId: string, employeeId: string) {
    const employee = await this.prisma.employee.findFirst({ where: { id: employeeId, companyId }, select: employeeSelect });
    if (!employee) throw new BadRequestException('Invalid employee');
    return employee;
  }

  async myProfile(user: AuthUser) {
    const employee = await this.currentEmployee(user);
    const profile = await this.prisma.salaryProfile.findFirst({ where: { companyId: user.companyId!, employeeId: employee.id }, include: { employee: { select: employeeSelect } } });
    if (!profile) throw new NotFoundException('Salary profile not found');
    return profile;
  }

  async getProfile(user: AuthUser, employeeId: string) {
    await this.assertEmployee(user.companyId!, employeeId);
    const profile = await this.prisma.salaryProfile.findFirst({ where: { companyId: user.companyId!, employeeId }, include: { employee: { select: employeeSelect } } });
    if (!profile) throw new NotFoundException('Salary profile not found');
    return profile;
  }

  async listProfiles(user: AuthUser, query: PaginationDto) {
    const where: Prisma.SalaryProfileWhereInput = {
      companyId: user.companyId!,
      ...(query.search && { employee: { OR: [{ fullName: { contains: query.search, mode: 'insensitive' } }, { employeeCode: { contains: query.search, mode: 'insensitive' } }] } }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.salaryProfile.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, include: { employee: { select: employeeSelect } }, orderBy: { employee: { fullName: 'asc' } } }),
      this.prisma.salaryProfile.count({ where }),
    ]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async upsertProfile(user: AuthUser, employeeId: string, dto: UpsertSalaryProfileDto) {
    await this.assertEmployee(user.companyId!, employeeId);
    const data = {
      baseSalary: new Prisma.Decimal(dto.baseSalary),
      allowance: new Prisma.Decimal(dto.allowance ?? 0),
      overtimeHourlyRate: new Prisma.Decimal(dto.overtimeHourlyRate ?? 0),
      standardWorkingDays: dto.standardWorkingDays ?? 26,
      standardMinutesPerDay: dto.standardMinutesPerDay ?? 480,
      currency: (dto.currency ?? 'VND').toUpperCase(),
    };
    return this.prisma.salaryProfile.upsert({
      where: { employeeId },
      create: { ...data, employeeId, companyId: user.companyId! },
      update: data,
      include: { employee: { select: employeeSelect } },
    });
  }

  async calculate(user: AuthUser, dto: CalculatePayrollDto) {
    if (!dto.employeeId && dto.deductions !== undefined) throw new BadRequestException('Deductions require an employeeId');
    if (dto.employeeId) await this.assertEmployee(user.companyId!, dto.employeeId);
    const profiles = await this.prisma.salaryProfile.findMany({
      where: { companyId: user.companyId!, ...(dto.employeeId && { employeeId: dto.employeeId }), employee: { status: 'ACTIVE' } },
      include: { employee: { select: employeeSelect } },
    });
    if (!profiles.length) throw new NotFoundException('No salary profile found');
    const finalized = await this.prisma.payroll.findFirst({
      where: { companyId: user.companyId!, employeeId: { in: profiles.map((profile) => profile.employeeId) }, year: parseMonth(dto.month).year, month: parseMonth(dto.month).month, status: PayrollStatus.FINALIZED },
      include: { employee: { select: employeeSelect } },
    });
    if (finalized) throw new ConflictException(`Payroll for ${finalized.employee.employeeCode} is finalized`);
    const results = [];
    for (const profile of profiles) results.push(await this.calculateOne(user.companyId!, profile, dto.month, dto.deductions ?? 0));
    return dto.employeeId ? results[0] : results;
  }

  private async calculateOne(companyId: string, profile: Prisma.SalaryProfileGetPayload<{ include: { employee: { select: typeof employeeSelect } } }>, monthValue: string, deductionsValue: number) {
    const { year, month, start, end } = parseMonth(monthValue);
    const existing = await this.prisma.payroll.findUnique({ where: { companyId_employeeId_year_month: { companyId, employeeId: profile.employeeId, year, month } } });
    if (existing?.status === PayrollStatus.FINALIZED) throw new ConflictException(`Payroll for ${profile.employee.employeeCode} is finalized`);
    const records = await this.prisma.attendance.findMany({ where: { companyId, employeeId: profile.employeeId, workDate: { gte: start, lt: end } }, select: { status: true, workedMinutes: true, regularMinutes: true, scheduledMinutes: true, overtimeMinutes: true } });
    let regularMinutes = 0;
    let paidLeaveMinutes = 0;
    let overtimeMinutes = 0;
    for (const record of records) {
      if (record.status === AttendanceStatus.PAID_LEAVE) paidLeaveMinutes += record.scheduledMinutes || profile.standardMinutesPerDay;
      else if (([AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.HALF_DAY] as AttendanceStatus[]).includes(record.status)) regularMinutes += record.scheduledMinutes ? record.regularMinutes : Math.min(record.workedMinutes, profile.standardMinutesPerDay);
      overtimeMinutes += record.overtimeMinutes;
    }
    const standardMonthMinutes = profile.standardWorkingDays * profile.standardMinutesPerDay;
    const payableMinutes = Math.min(regularMinutes + paidLeaveMinutes, standardMonthMinutes);
    const attendancePay = profile.baseSalary.mul(new Prisma.Decimal(payableMinutes).div(standardMonthMinutes)).toDecimalPlaces(2);
    const overtimePay = profile.overtimeHourlyRate.mul(new Prisma.Decimal(overtimeMinutes).div(60)).toDecimalPlaces(2);
    const deductions = new Prisma.Decimal(deductionsValue);
    const netSalary = Prisma.Decimal.max(new Prisma.Decimal(0), attendancePay.add(profile.allowance).add(overtimePay).sub(deductions)).toDecimalPlaces(2);
    const data = {
      baseSalary: profile.baseSalary,
      allowance: profile.allowance,
      overtimeHourlyRate: profile.overtimeHourlyRate,
      standardWorkingDays: profile.standardWorkingDays,
      standardMinutesPerDay: profile.standardMinutesPerDay,
      regularMinutes,
      paidLeaveMinutes,
      overtimeMinutes,
      attendancePay,
      overtimePay,
      deductions,
      netSalary,
      currency: profile.currency,
      calculatedAt: new Date(),
    };
    return this.prisma.payroll.upsert({
      where: { companyId_employeeId_year_month: { companyId, employeeId: profile.employeeId, year, month } },
      create: { ...data, companyId, employeeId: profile.employeeId, year, month },
      update: data,
      include: { employee: { select: employeeSelect } },
    });
  }

  async list(user: AuthUser, query: PayrollQueryDto) {
    let employeeId = query.employeeId;
    if (user.role === Role.EMPLOYEE) employeeId = (await this.currentEmployee(user)).id;
    const parsed = query.month ? parseMonth(query.month) : undefined;
    const where: Prisma.PayrollWhereInput = { companyId: user.companyId!, ...(employeeId && { employeeId }), ...(parsed && { year: parsed.year, month: parsed.month }), ...(query.search && { employee: { OR: [{ fullName: { contains: query.search, mode: 'insensitive' } }, { employeeCode: { contains: query.search, mode: 'insensitive' } }] } }) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payroll.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, include: { employee: { select: employeeSelect } }, orderBy: [{ year: 'desc' }, { month: 'desc' }] }),
      this.prisma.payroll.count({ where }),
    ]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async get(user: AuthUser, id: string) {
    const row = await this.prisma.payroll.findFirst({ where: { id, companyId: user.companyId! }, include: { employee: { select: employeeSelect } } });
    if (!row) throw new NotFoundException('Payroll not found');
    if (user.role === Role.EMPLOYEE && row.employeeId !== (await this.currentEmployee(user)).id) throw new ForbiddenException();
    return row;
  }

  async finalize(user: AuthUser, id: string) {
    const row = await this.get(user, id);
    if (row.status === PayrollStatus.FINALIZED) return row;
    return this.prisma.payroll.update({ where: { id: row.id }, data: { status: PayrollStatus.FINALIZED, finalizedAt: new Date() }, include: { employee: { select: employeeSelect } } });
  }
}
