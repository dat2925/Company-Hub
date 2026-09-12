CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'PAID_LEAVE', 'UNPAID_LEAVE');
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'FINALIZED');

CREATE TABLE "Attendance" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "workDate" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "workedMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalaryProfile" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "baseSalary" DECIMAL(18,2) NOT NULL,
    "allowance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "overtimeHourlyRate" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "standardWorkingDays" INTEGER NOT NULL DEFAULT 26,
    "standardMinutesPerDay" INTEGER NOT NULL DEFAULT 480,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SalaryProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payroll" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "baseSalary" DECIMAL(18,2) NOT NULL,
    "allowance" DECIMAL(18,2) NOT NULL,
    "overtimeHourlyRate" DECIMAL(18,2) NOT NULL,
    "standardWorkingDays" INTEGER NOT NULL,
    "standardMinutesPerDay" INTEGER NOT NULL,
    "regularMinutes" INTEGER NOT NULL,
    "paidLeaveMinutes" INTEGER NOT NULL,
    "overtimeMinutes" INTEGER NOT NULL,
    "attendancePay" DECIMAL(18,2) NOT NULL,
    "overtimePay" DECIMAL(18,2) NOT NULL,
    "deductions" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "netSalary" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Attendance_companyId_employeeId_workDate_key" ON "Attendance"("companyId", "employeeId", "workDate");
CREATE INDEX "Attendance_companyId_workDate_idx" ON "Attendance"("companyId", "workDate");
CREATE INDEX "Attendance_employeeId_workDate_idx" ON "Attendance"("employeeId", "workDate");
CREATE UNIQUE INDEX "SalaryProfile_employeeId_key" ON "SalaryProfile"("employeeId");
CREATE INDEX "SalaryProfile_companyId_idx" ON "SalaryProfile"("companyId");
CREATE UNIQUE INDEX "Payroll_companyId_employeeId_year_month_key" ON "Payroll"("companyId", "employeeId", "year", "month");
CREATE INDEX "Payroll_companyId_year_month_idx" ON "Payroll"("companyId", "year", "month");
CREATE INDEX "Payroll_employeeId_year_month_idx" ON "Payroll"("employeeId", "year", "month");

ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalaryProfile" ADD CONSTRAINT "SalaryProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalaryProfile" ADD CONSTRAINT "SalaryProfile_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
