import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus, Prisma, Role } from '@prisma/client';
import { pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceQueryDto, CheckInDto, CheckOutDto, CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';

const employeeSelect = { id: true, employeeCode: true, fullName: true } as const;
type AttendanceMutableData = {
  employeeId?: string;
  checkIn?: Date;
  checkOut?: Date;
  status?: AttendanceStatus;
  workedMinutes?: number;
  overtimeMinutes?: number;
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

  async checkIn(user: AuthUser, dto: CheckInDto) {
    const employee = await this.currentEmployee(user);
    const workDate = parseWorkDate(todayInAppTimeZone());
    const existing = await this.prisma.attendance.findUnique({ where: { companyId_employeeId_workDate: { companyId: user.companyId!, employeeId: employee.id, workDate } } });
    if (existing) throw new ConflictException('Attendance already exists for today');
    return this.prisma.attendance.create({ data: { companyId: user.companyId!, employeeId: employee.id, workDate, checkIn: new Date(), note: dto.note }, include: { employee: { select: employeeSelect } } });
  }

  async checkOut(user: AuthUser, dto: CheckOutDto) {
    const employee = await this.currentEmployee(user);
    const workDate = parseWorkDate(todayInAppTimeZone());
    const attendance = await this.prisma.attendance.findUnique({ where: { companyId_employeeId_workDate: { companyId: user.companyId!, employeeId: employee.id, workDate } } });
    if (!attendance?.checkIn) throw new BadRequestException('You must check in first');
    if (attendance.checkOut) throw new ConflictException('You have already checked out');
    const checkOut = new Date();
    const workedMinutes = Math.max(0, Math.floor((checkOut.getTime() - attendance.checkIn.getTime()) / 60000));
    const profile = await this.prisma.salaryProfile.findUnique({ where: { employeeId: employee.id }, select: { standardMinutesPerDay: true } });
    const overtimeMinutes = Math.max(0, workedMinutes - (profile?.standardMinutesPerDay ?? 480));
    return this.prisma.attendance.update({ where: { id: attendance.id }, data: { checkOut, workedMinutes, overtimeMinutes, ...(dto.note !== undefined && { note: dto.note }) }, include: { employee: { select: employeeSelect } } });
  }

  async list(user: AuthUser, query: AttendanceQueryDto) {
    let employeeId = query.employeeId;
    if (user.role === Role.EMPLOYEE) employeeId = (await this.currentEmployee(user)).id;
    const where: Prisma.AttendanceWhereInput = { companyId: user.companyId!, ...(employeeId && { employeeId }), ...(query.month && { workDate: monthRange(query.month) }) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, include: { employee: { select: employeeSelect } }, orderBy: [{ workDate: 'desc' }, { checkIn: 'desc' }] }),
      this.prisma.attendance.count({ where }),
    ]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async summary(user: AuthUser, query: AttendanceQueryDto) {
    let employeeId = query.employeeId;
    if (user.role === Role.EMPLOYEE) employeeId = (await this.currentEmployee(user)).id;
    const where: Prisma.AttendanceWhereInput = { companyId: user.companyId!, ...(employeeId && { employeeId }), ...(query.month && { workDate: monthRange(query.month) }) };
    const [totals, statuses] = await Promise.all([
      this.prisma.attendance.aggregate({ where, _count: true, _sum: { workedMinutes: true, overtimeMinutes: true } }),
      this.prisma.attendance.groupBy({ by: ['status'], where, _count: true }),
    ]);
    return { records: totals._count, workedMinutes: totals._sum.workedMinutes ?? 0, overtimeMinutes: totals._sum.overtimeMinutes ?? 0, byStatus: Object.fromEntries(statuses.map((row) => [row.status, row._count])) };
  }

  async get(user: AuthUser, id: string) {
    const row = await this.prisma.attendance.findFirst({ where: { id, companyId: user.companyId! }, include: { employee: { select: employeeSelect } } });
    if (!row) throw new NotFoundException('Attendance not found');
    if (user.role === Role.EMPLOYEE && row.employeeId !== (await this.currentEmployee(user)).id) throw new ForbiddenException();
    return row;
  }

  async create(user: AuthUser, dto: CreateAttendanceDto) {
    await this.assertEmployee(user.companyId!, dto.employeeId);
    const workDate = parseWorkDate(dto.workDate);
    const existing = await this.prisma.attendance.findUnique({ where: { companyId_employeeId_workDate: { companyId: user.companyId!, employeeId: dto.employeeId, workDate } }, select: { id: true } });
    if (existing) throw new ConflictException('Attendance already exists for this employee and date');
    const data = this.toData(dto);
    return this.prisma.attendance.create({ data: { ...data, companyId: user.companyId!, employeeId: dto.employeeId, workDate }, include: { employee: { select: employeeSelect } } });
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
    const data = this.toData(dto);
    const finalCheckIn = dto.checkIn ? new Date(dto.checkIn) : current.checkIn;
    const finalCheckOut = dto.checkOut ? new Date(dto.checkOut) : current.checkOut;
    if (finalCheckIn && finalCheckOut && finalCheckOut <= finalCheckIn) throw new BadRequestException('Check-out must be after check-in');
    if ((dto.checkIn || dto.checkOut) && finalCheckIn && finalCheckOut) {
      const workedMinutes = Math.floor((finalCheckOut.getTime() - finalCheckIn.getTime()) / 60000);
      const profile = await this.prisma.salaryProfile.findUnique({ where: { employeeId: targetEmployeeId }, select: { standardMinutesPerDay: true } });
      if (dto.workedMinutes === undefined) data.workedMinutes = workedMinutes;
      if (dto.overtimeMinutes === undefined) data.overtimeMinutes = Math.max(0, workedMinutes - (profile?.standardMinutesPerDay ?? 480));
    }
    return this.prisma.attendance.update({ where: { id: current.id }, data: { ...data, ...(dto.workDate && { workDate: targetWorkDate }) }, include: { employee: { select: employeeSelect } } });
  }

  async remove(user: AuthUser, id: string) {
    const current = await this.get(user, id);
    return this.prisma.attendance.delete({ where: { id: current.id } });
  }

  private toData(dto: CreateAttendanceDto | UpdateAttendanceDto): AttendanceMutableData {
    const checkIn = dto.checkIn ? new Date(dto.checkIn) : undefined;
    const checkOut = dto.checkOut ? new Date(dto.checkOut) : undefined;
    if (checkIn && checkOut && checkOut <= checkIn) throw new BadRequestException('Check-out must be after check-in');
    const calculated = checkIn && checkOut ? Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000) : undefined;
    return {
      ...(dto.employeeId && { employeeId: dto.employeeId }),
      ...(checkIn && { checkIn }),
      ...(checkOut && { checkOut }),
      ...(dto.status && { status: dto.status }),
      ...(dto.note !== undefined && { note: dto.note }),
      ...(dto.workedMinutes !== undefined ? { workedMinutes: dto.workedMinutes } : calculated !== undefined ? { workedMinutes: calculated } : {}),
      ...(dto.overtimeMinutes !== undefined && { overtimeMinutes: dto.overtimeMinutes }),
    };
  }
}
