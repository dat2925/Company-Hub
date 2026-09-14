import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { BulkAssignShiftDto, CreateShiftAssignmentDto, CreateShiftDto, ShiftAssignmentQueryDto, ShiftQueryDto, UpdateShiftAssignmentDto, UpdateShiftDto } from './dto/shift.dto';
import { buildSchedule } from './shift-time';

const assignmentInclude = { employee: { select: { id: true, employeeCode: true, fullName: true } }, shift: true } as const;
const parseDate = (value: string) => new Date(`${value}T00:00:00.000Z`);
const formatDate = (date: Date) => date.toISOString().slice(0, 10);

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser, query: ShiftQueryDto) {
    const where: Prisma.ShiftWhereInput = { companyId: user.companyId!, ...(query.search && { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { code: { contains: query.search, mode: 'insensitive' } }] }), ...(query.isActive !== undefined && { isActive: query.isActive }) };
    const [data, total] = await this.prisma.$transaction([this.prisma.shift.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: [{ isActive: 'desc' }, { name: 'asc' }] }), this.prisma.shift.count({ where })]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  options(user: AuthUser) { return this.prisma.shift.findMany({ where: { companyId: user.companyId!, isActive: true }, select: { id: true, code: true, name: true, startTime: true, endTime: true }, orderBy: { name: 'asc' } }); }

  async get(user: AuthUser, id: string) {
    const shift = await this.prisma.shift.findFirst({ where: { id, companyId: user.companyId! } });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async create(user: AuthUser, dto: CreateShiftDto) {
    buildSchedule('2000-01-01', { startTime: dto.startTime, endTime: dto.endTime, breakMinutes: dto.breakMinutes ?? 0, lateGraceMinutes: dto.lateGraceMinutes ?? 0, earlyLeaveGraceMinutes: dto.earlyLeaveGraceMinutes ?? 0, overtimeAllowed: dto.overtimeAllowed ?? true, overtimeThresholdMinutes: dto.overtimeThresholdMinutes ?? 0 });
    const duplicate = await this.prisma.shift.findUnique({ where: { companyId_code: { companyId: user.companyId!, code: dto.code.toUpperCase() } }, select: { id: true } });
    if (duplicate) throw new ConflictException('Shift code already exists');
    return this.prisma.shift.create({ data: { ...dto, code: dto.code.toUpperCase(), companyId: user.companyId! } });
  }

  async update(user: AuthUser, id: string, dto: UpdateShiftDto) {
    const current = await this.get(user, id);
    const merged = { ...current, ...dto };
    buildSchedule('2000-01-01', merged);
    if (dto.code) {
      const duplicate = await this.prisma.shift.findUnique({ where: { companyId_code: { companyId: user.companyId!, code: dto.code.toUpperCase() } }, select: { id: true } });
      if (duplicate && duplicate.id !== id) throw new ConflictException('Shift code already exists');
    }
    return this.prisma.shift.update({ where: { id }, data: { ...dto, code: dto.code?.toUpperCase() } });
  }

  async remove(user: AuthUser, id: string) {
    await this.get(user, id);
    const assignments = await this.prisma.shiftAssignment.count({ where: { shiftId: id } });
    if (assignments) throw new ConflictException('Shift has assignments and cannot be deleted; deactivate it instead');
    return this.prisma.shift.delete({ where: { id } });
  }
}

@Injectable()
export class ShiftAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async currentEmployee(user: AuthUser) {
    const employee = await this.prisma.employee.findFirst({ where: { companyId: user.companyId!, userId: user.id }, select: { id: true } });
    if (!employee) throw new BadRequestException('Your account is not linked to an employee');
    return employee;
  }

  private async links(companyId: string, employeeId: string, shiftId: string) {
    const [employee, shift] = await Promise.all([this.prisma.employee.findFirst({ where: { id: employeeId, companyId }, select: { id: true } }), this.prisma.shift.findFirst({ where: { id: shiftId, companyId } })]);
    if (!employee) throw new BadRequestException('Invalid employee');
    if (!shift) throw new BadRequestException('Invalid shift');
    return shift;
  }

  async list(user: AuthUser, query: ShiftAssignmentQueryDto) {
    let employeeId = query.employeeId;
    if (user.role === Role.EMPLOYEE) employeeId = (await this.currentEmployee(user)).id;
    const where: Prisma.ShiftAssignmentWhereInput = { companyId: user.companyId!, ...(employeeId && { employeeId }), ...(query.shiftId && { shiftId: query.shiftId }), ...((query.from || query.to) && { workDate: { ...(query.from && { gte: parseDate(query.from) }), ...(query.to && { lte: parseDate(query.to) }) } }) };
    const [data, total] = await this.prisma.$transaction([this.prisma.shiftAssignment.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, include: assignmentInclude, orderBy: [{ workDate: 'desc' }, { scheduledStartAt: 'asc' }] }), this.prisma.shiftAssignment.count({ where })]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async get(user: AuthUser, id: string) {
    const row = await this.prisma.shiftAssignment.findFirst({ where: { id, companyId: user.companyId! }, include: assignmentInclude });
    if (!row) throw new NotFoundException('Shift assignment not found');
    if (user.role === Role.EMPLOYEE && row.employeeId !== (await this.currentEmployee(user)).id) throw new NotFoundException('Shift assignment not found');
    return row;
  }

  async create(user: AuthUser, dto: CreateShiftAssignmentDto) {
    const shift = await this.links(user.companyId!, dto.employeeId, dto.shiftId);
    const workDate = parseDate(dto.workDate);
    const duplicate = await this.prisma.shiftAssignment.findUnique({ where: { companyId_employeeId_workDate: { companyId: user.companyId!, employeeId: dto.employeeId, workDate } }, select: { id: true } });
    if (duplicate) throw new ConflictException('Employee already has a shift on this date');
    const schedule = buildSchedule(dto.workDate, shift);
    return this.prisma.shiftAssignment.create({ data: { companyId: user.companyId!, employeeId: dto.employeeId, shiftId: dto.shiftId, workDate, note: dto.note, ...schedule }, include: assignmentInclude });
  }

  async bulkCreate(user: AuthUser, dto: BulkAssignShiftDto) {
    const uniqueEmployees = [...new Set(dto.employeeIds)];
    const employees = await this.prisma.employee.count({ where: { companyId: user.companyId!, id: { in: uniqueEmployees } } });
    if (employees !== uniqueEmployees.length) throw new BadRequestException('One or more employees are invalid');
    const shift = await this.prisma.shift.findFirst({ where: { id: dto.shiftId, companyId: user.companyId! } });
    if (!shift) throw new BadRequestException('Invalid shift');
    const start = parseDate(dto.startDate), end = parseDate(dto.endDate);
    if (end < start) throw new BadRequestException('End date must be on or after start date');
    const totalDays = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    if (totalDays > 366) throw new BadRequestException('Assignment range cannot exceed 366 days');
    const allowedDays = new Set(dto.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]);
    const dates: Date[] = [];
    for (let day = new Date(start); day <= end; day = new Date(day.getTime() + 86400000)) if (allowedDays.has(day.getUTCDay())) dates.push(day);
    const existing = await this.prisma.shiftAssignment.findMany({ where: { companyId: user.companyId!, employeeId: { in: uniqueEmployees }, workDate: { in: dates } }, select: { employeeId: true, workDate: true } });
    const existingKeys = new Set(existing.map((row) => `${row.employeeId}:${formatDate(row.workDate)}`));
    const rows = uniqueEmployees.flatMap((employeeId) => dates.filter((date) => !existingKeys.has(`${employeeId}:${formatDate(date)}`)).map((date) => ({ companyId: user.companyId!, employeeId, shiftId: dto.shiftId, workDate: date, note: dto.note, ...buildSchedule(formatDate(date), shift) })));
    if (rows.length) await this.prisma.shiftAssignment.createMany({ data: rows });
    return { created: rows.length, skipped: uniqueEmployees.length * dates.length - rows.length };
  }

  async update(user: AuthUser, id: string, dto: UpdateShiftAssignmentDto) {
    const current = await this.get(user, id);
    const employeeId = dto.employeeId ?? current.employeeId, shiftId = dto.shiftId ?? current.shiftId;
    const shift = await this.links(user.companyId!, employeeId, shiftId);
    const workDateString = dto.workDate ?? formatDate(current.workDate), workDate = parseDate(workDateString);
    const duplicate = await this.prisma.shiftAssignment.findUnique({ where: { companyId_employeeId_workDate: { companyId: user.companyId!, employeeId, workDate } }, select: { id: true } });
    if (duplicate && duplicate.id !== id) throw new ConflictException('Employee already has a shift on this date');
    const attendance = await this.prisma.attendance.findUnique({ where: { shiftAssignmentId: id }, select: { id: true } });
    if (attendance && (dto.employeeId || dto.workDate || dto.shiftId)) throw new ConflictException('Cannot reschedule an assignment already linked to attendance');
    return this.prisma.shiftAssignment.update({ where: { id }, data: { employeeId, shiftId, workDate, ...(dto.note !== undefined && { note: dto.note }), ...buildSchedule(workDateString, shift) }, include: assignmentInclude });
  }

  async remove(user: AuthUser, id: string) {
    await this.get(user, id);
    const attendance = await this.prisma.attendance.findUnique({ where: { shiftAssignmentId: id }, select: { id: true } });
    if (attendance) throw new ConflictException('Cannot delete an assignment already linked to attendance');
    return this.prisma.shiftAssignment.delete({ where: { id } });
  }
}
