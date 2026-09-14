import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus, Prisma, Role } from '@prisma/client';
import { pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceQueryDto, CheckInDto, CheckOutDto, CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';
import { AssignmentTiming, calculateAttendance } from '../shifts/shift-time';

const employeeSelect = { id: true, employeeCode: true, fullName: true } as const;
const attendanceInclude = { employee: { select: employeeSelect }, shiftAssignment: { include: { shift: true } } } as const;
type AttendanceMutableData = {
  employeeId?: string;
  shiftAssignmentId?: string | null;
  checkIn?: Date;
  checkOut?: Date;
  status?: AttendanceStatus;
  workedMinutes?: number;
  overtimeMinutes?: number;
  regularMinutes?: number;
  scheduledMinutes?: number;
  earlyArrivalMinutes?: number;
  lateArrivalMinutes?: number;
  earlyLeaveMinutes?: number;
  lateLeaveMinutes?: number;
  note?: string;
};

function parseWorkDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new BadRequestException('Invalid work date');
  return date;
}

function monthRange(month?: string) {
  if (!month) return undefined;
  const [year, monthNumber] = month.split('-').map(Number);
  return { gte: new Date(Date.UTC(year, monthNumber - 1, 1)), lt: new Date(Date.UTC(year, monthNumber, 1)) };
}

function todayInAppTimeZone(): string {
  const timeZone = process.env.APP_TIME_ZONE ?? 'Asia/Ho_Chi_Minh';
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private present<T extends { overtimeMinutes: number }>(row: T) { return { ...row, hasOvertime: row.overtimeMinutes > 0 }; }

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

  private async resolveAssignment(companyId: string, employeeId: string, workDate: Date, assignmentId?: string) {
    const assignment = assignmentId
      ? await this.prisma.shiftAssignment.findFirst({ where: { id: assignmentId, companyId, employeeId, workDate }, include: { shift: true } })
      : await this.prisma.shiftAssignment.findUnique({ where: { companyId_employeeId_workDate: { companyId, employeeId, workDate } }, include: { shift: true } });
    if (assignmentId && !assignment) throw new BadRequestException('Shift assignment does not match employee and work date');
    return assignment;
  }

  private async currentAssignment(companyId: string, employeeId: string, now: Date) {
    const today = parseWorkDate(todayInAppTimeZone());
    const yesterday = new Date(today.getTime() - 86400000);
    const candidates = await this.prisma.shiftAssignment.findMany({ where: { companyId, employeeId, workDate: { in: [yesterday, today] } }, include: { shift: true } });
    return candidates
      .map((assignment) => ({ assignment, distance: now < assignment.scheduledStartAt ? assignment.scheduledStartAt.getTime() - now.getTime() : now > assignment.scheduledEndAt ? now.getTime() - assignment.scheduledEndAt.getTime() : 0 }))
      .filter(({ distance }) => distance <= 4 * 60 * 60 * 1000)
      .sort((a, b) => a.distance - b.distance)[0]?.assignment ?? null;
  }

  private calculatedData(checkIn: Date, checkOut: Date, assignment: AssignmentTiming | null, standardMinutes: number): AttendanceMutableData {
    if (!assignment) {
      const workedMinutes = Math.max(0, Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000));
      return { workedMinutes, regularMinutes: Math.min(workedMinutes, standardMinutes), scheduledMinutes: standardMinutes, overtimeMinutes: Math.max(0, workedMinutes - standardMinutes), earlyArrivalMinutes: 0, lateArrivalMinutes: 0, earlyLeaveMinutes: 0, lateLeaveMinutes: 0 };
    }
    return calculateAttendance(checkIn, checkOut, assignment);
  }

  private dateFilter(query: AttendanceQueryDto): Prisma.DateTimeFilter | undefined {
    if (query.month) return monthRange(query.month);
    if (query.from || query.to) return { ...(query.from && { gte: parseWorkDate(query.from) }), ...(query.to && { lte: parseWorkDate(query.to) }) };
    return undefined;
  }

  async checkIn(user: AuthUser, dto: CheckInDto) {
    const employee = await this.currentEmployee(user);
    const checkIn = new Date();
    const assignment = await this.currentAssignment(user.companyId!, employee.id, checkIn);
    const workDate = assignment?.workDate ?? parseWorkDate(todayInAppTimeZone());
    const existing = await this.prisma.attendance.findUnique({ where: { companyId_employeeId_workDate: { companyId: user.companyId!, employeeId: employee.id, workDate } } });
    if (existing) throw new ConflictException('Attendance already exists for today');
    return this.present(await this.prisma.attendance.create({ data: { companyId: user.companyId!, employeeId: employee.id, workDate, checkIn, note: dto.note, shiftAssignmentId: assignment?.id }, include: attendanceInclude }));
  }

  async checkOut(user: AuthUser, dto: CheckOutDto) {
    const employee = await this.currentEmployee(user);
    const oldestValidCheckIn = new Date(Date.now() - 36 * 60 * 60 * 1000);
    const attendance = await this.prisma.attendance.findFirst({ where: { companyId: user.companyId!, employeeId: employee.id, checkIn: { not: null, gte: oldestValidCheckIn }, checkOut: null }, orderBy: { checkIn: 'desc' } });
    if (!attendance?.checkIn) throw new BadRequestException('You must check in first');
    const checkOut = new Date();
    const [profile, assignment] = await Promise.all([
      this.prisma.salaryProfile.findUnique({ where: { employeeId: employee.id }, select: { standardMinutesPerDay: true } }),
      attendance.shiftAssignmentId ? this.prisma.shiftAssignment.findUnique({ where: { id: attendance.shiftAssignmentId } }) : this.resolveAssignment(user.companyId!, employee.id, attendance.workDate),
    ]);
    const calculation = this.calculatedData(attendance.checkIn, checkOut, assignment, profile?.standardMinutesPerDay ?? 480);
    return this.present(await this.prisma.attendance.update({ where: { id: attendance.id }, data: { checkOut, ...calculation, ...(assignment && !attendance.shiftAssignmentId && { shiftAssignmentId: assignment.id }), ...(dto.note !== undefined && { note: dto.note }), ...(calculation.lateArrivalMinutes && attendance.status === AttendanceStatus.PRESENT && { status: AttendanceStatus.LATE }) }, include: attendanceInclude }));
  }

  async list(user: AuthUser, query: AttendanceQueryDto) {
    let employeeId = query.employeeId;
    if (user.role === Role.EMPLOYEE) employeeId = (await this.currentEmployee(user)).id;
    const dateFilter = this.dateFilter(query);
    const where: Prisma.AttendanceWhereInput = { companyId: user.companyId!, ...(employeeId && { employeeId }), ...(dateFilter && { workDate: dateFilter }) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, include: attendanceInclude, orderBy: [{ workDate: 'desc' }, { checkIn: 'desc' }] }),
      this.prisma.attendance.count({ where }),
    ]);
    return { data: data.map((row) => this.present(row)), meta: pageMeta(query.page, query.pageSize, total) };
  }

  async summary(user: AuthUser, query: AttendanceQueryDto) {
    let employeeId = query.employeeId;
    if (user.role === Role.EMPLOYEE) employeeId = (await this.currentEmployee(user)).id;
    const dateFilter = this.dateFilter(query);
    const where: Prisma.AttendanceWhereInput = { companyId: user.companyId!, ...(employeeId && { employeeId }), ...(dateFilter && { workDate: dateFilter }) };
    const [totals, statuses, overtimeRecords] = await Promise.all([
      this.prisma.attendance.aggregate({ where, _count: true, _sum: { workedMinutes: true, regularMinutes: true, overtimeMinutes: true, earlyArrivalMinutes: true, lateArrivalMinutes: true, earlyLeaveMinutes: true, lateLeaveMinutes: true } }),
      this.prisma.attendance.groupBy({ by: ['status'], where, _count: true }),
      this.prisma.attendance.count({ where: { ...where, overtimeMinutes: { gt: 0 } } }),
    ]);
    return { records: totals._count, overtimeRecords, workedMinutes: totals._sum.workedMinutes ?? 0, regularMinutes: totals._sum.regularMinutes ?? 0, overtimeMinutes: totals._sum.overtimeMinutes ?? 0, earlyArrivalMinutes: totals._sum.earlyArrivalMinutes ?? 0, lateArrivalMinutes: totals._sum.lateArrivalMinutes ?? 0, earlyLeaveMinutes: totals._sum.earlyLeaveMinutes ?? 0, lateLeaveMinutes: totals._sum.lateLeaveMinutes ?? 0, byStatus: Object.fromEntries(statuses.map((row) => [row.status, row._count])) };
  }

  async get(user: AuthUser, id: string) {
    const row = await this.prisma.attendance.findFirst({ where: { id, companyId: user.companyId! }, include: attendanceInclude });
    if (!row) throw new NotFoundException('Attendance not found');
    if (user.role === Role.EMPLOYEE && row.employeeId !== (await this.currentEmployee(user)).id) throw new ForbiddenException();
    return this.present(row);
  }

  async create(user: AuthUser, dto: CreateAttendanceDto) {
    await this.assertEmployee(user.companyId!, dto.employeeId);
    const workDate = parseWorkDate(dto.workDate);
    const existing = await this.prisma.attendance.findUnique({ where: { companyId_employeeId_workDate: { companyId: user.companyId!, employeeId: dto.employeeId, workDate } }, select: { id: true } });
    if (existing) throw new ConflictException('Attendance already exists for this employee and date');
    const assignment = await this.resolveAssignment(user.companyId!, dto.employeeId, workDate, dto.shiftAssignmentId);
    const data = await this.toData(dto, dto.employeeId, assignment);
    return this.present(await this.prisma.attendance.create({ data: { ...data, companyId: user.companyId!, employeeId: dto.employeeId, workDate, shiftAssignmentId: assignment?.id }, include: attendanceInclude }));
  }

  async update(user: AuthUser, id: string, dto: UpdateAttendanceDto) {
    const current = await this.get(user, id);
    if (dto.employeeId) await this.assertEmployee(user.companyId!, dto.employeeId);
    const targetEmployeeId = dto.employeeId ?? current.employeeId;
    const targetWorkDate = dto.workDate ? parseWorkDate(dto.workDate) : current.workDate;
    if (dto.employeeId || dto.workDate) {
      const duplicate = await this.prisma.attendance.findUnique({ where: { companyId_employeeId_workDate: { companyId: user.companyId!, employeeId: targetEmployeeId, workDate: targetWorkDate } }, select: { id: true } });
      if (duplicate && duplicate.id !== current.id) throw new ConflictException('Attendance already exists for this employee and date');
    }
    const assignmentId = dto.shiftAssignmentId ?? (dto.employeeId || dto.workDate ? undefined : current.shiftAssignmentId ?? undefined);
    const assignment = await this.resolveAssignment(user.companyId!, targetEmployeeId, targetWorkDate, assignmentId);
    const data = await this.toData(dto, targetEmployeeId, assignment, current);
    const finalCheckIn = dto.checkIn ? new Date(dto.checkIn) : current.checkIn;
    const finalCheckOut = dto.checkOut ? new Date(dto.checkOut) : current.checkOut;
    if (finalCheckIn && finalCheckOut && finalCheckOut <= finalCheckIn) throw new BadRequestException('Check-out must be after check-in');
    return this.present(await this.prisma.attendance.update({ where: { id: current.id }, data: { ...data, shiftAssignmentId: assignment?.id ?? null, ...(dto.workDate && { workDate: targetWorkDate }) }, include: attendanceInclude }));
  }

  async remove(user: AuthUser, id: string) {
    const current = await this.get(user, id);
    return this.prisma.attendance.delete({ where: { id: current.id } });
  }

  private async toData(dto: CreateAttendanceDto | UpdateAttendanceDto, employeeId: string, assignment: AssignmentTiming | null, current?: { checkIn: Date | null; checkOut: Date | null; status: AttendanceStatus }): Promise<AttendanceMutableData> {
    const checkIn = dto.checkIn ? new Date(dto.checkIn) : current?.checkIn ?? undefined;
    const checkOut = dto.checkOut ? new Date(dto.checkOut) : current?.checkOut ?? undefined;
    if (checkIn && checkOut && checkOut <= checkIn) throw new BadRequestException('Check-out must be after check-in');
    let calculation: AttendanceMutableData = assignment ? { scheduledMinutes: Math.max(0, Math.floor((assignment.scheduledEndAt.getTime() - assignment.scheduledStartAt.getTime()) / 60000) - assignment.breakMinutes) } : {};
    if (checkIn && checkOut) {
      const profile = await this.prisma.salaryProfile.findUnique({ where: { employeeId }, select: { standardMinutesPerDay: true } });
      calculation = this.calculatedData(checkIn, checkOut, assignment, profile?.standardMinutesPerDay ?? 480);
    }
    const result: AttendanceMutableData = {
      ...(dto.employeeId && { employeeId: dto.employeeId }),
      ...(dto.checkIn && { checkIn }),
      ...(dto.checkOut && { checkOut }),
      ...calculation,
      ...(dto.status ? { status: dto.status } : calculation.lateArrivalMinutes ? { status: AttendanceStatus.LATE } : {}),
      ...(dto.note !== undefined && { note: dto.note }),
      ...(dto.workedMinutes !== undefined && { workedMinutes: dto.workedMinutes }),
      ...(dto.overtimeMinutes !== undefined && { overtimeMinutes: dto.overtimeMinutes }),
    };
    return result;
  }
}
