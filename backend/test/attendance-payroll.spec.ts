import { AttendanceStatus, Prisma, Role } from '@prisma/client';
import { AttendanceService } from '../src/attendance/attendance.service';
import { PayrollService } from '../src/payroll/payroll.service';

const admin = { id: 'admin-a', email: 'admin@a.com', role: Role.ADMIN, companyId: 'company-a' };
const employeeUser = { id: 'user-a', email: 'employee@a.com', role: Role.EMPLOYEE, companyId: 'company-a' };

describe('Attendance and payroll', () => {
  it('always scopes an employee attendance list to their linked profile', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const prisma = {
      employee: { findFirst: jest.fn().mockResolvedValue({ id: 'employee-a', employeeCode: 'E1', fullName: 'Employee' }) },
      attendance: { findMany, count },
      $transaction: jest.fn((calls: unknown[]) => Promise.all(calls)),
    };
    await new AttendanceService(prisma as never).list(employeeUser, { page: 1, pageSize: 10, employeeId: 'employee-b' });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ companyId: 'company-a', employeeId: 'employee-a' }) }));
  });

  it('calculates salary from payable minutes, paid leave, overtime and allowance', async () => {
    const upsert = jest.fn().mockImplementation(({ create }) => ({ id: 'payroll-a', ...create }));
    const profile = {
      employeeId: 'employee-a',
      baseSalary: new Prisma.Decimal(26000000),
      allowance: new Prisma.Decimal(1000000),
      overtimeHourlyRate: new Prisma.Decimal(100000),
      standardWorkingDays: 26,
      standardMinutesPerDay: 480,
      currency: 'VND',
      employee: { id: 'employee-a', employeeCode: 'E1', fullName: 'Employee' },
    };
    const prisma = {
      salaryProfile: { findMany: jest.fn().mockResolvedValue([profile]) },
      payroll: { findFirst: jest.fn().mockResolvedValue(null), findUnique: jest.fn().mockResolvedValue(null), upsert },
      attendance: { findMany: jest.fn().mockResolvedValue([
        { status: AttendanceStatus.PRESENT, workedMinutes: 480, overtimeMinutes: 60 },
        { status: AttendanceStatus.PAID_LEAVE, workedMinutes: 0, overtimeMinutes: 0 },
      ]) },
    };
    const result = await new PayrollService(prisma as never).calculate(admin, { month: '2026-09' }) as Array<{ attendancePay: Prisma.Decimal; overtimePay: Prisma.Decimal; netSalary: Prisma.Decimal }>;
    expect(result[0].attendancePay.toNumber()).toBe(2000000);
    expect(result[0].overtimePay.toNumber()).toBe(100000);
    expect(result[0].netSalary.toNumber()).toBe(3100000);
  });
});
