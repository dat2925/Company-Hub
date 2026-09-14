-- Add detailed attendance calculations and shift scheduling.
ALTER TABLE "Attendance"
ADD COLUMN "shiftAssignmentId" UUID,
ADD COLUMN "regularMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "scheduledMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "earlyArrivalMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lateArrivalMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "earlyLeaveMinutes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lateLeaveMinutes" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "Shift" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "breakMinutes" INTEGER NOT NULL DEFAULT 0,
  "lateGraceMinutes" INTEGER NOT NULL DEFAULT 0,
  "earlyLeaveGraceMinutes" INTEGER NOT NULL DEFAULT 0,
  "overtimeAllowed" BOOLEAN NOT NULL DEFAULT true,
  "overtimeThresholdMinutes" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShiftAssignment" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "shiftId" UUID NOT NULL,
  "workDate" DATE NOT NULL,
  "scheduledStartAt" TIMESTAMP(3) NOT NULL,
  "scheduledEndAt" TIMESTAMP(3) NOT NULL,
  "breakMinutes" INTEGER NOT NULL,
  "lateGraceMinutes" INTEGER NOT NULL,
  "earlyLeaveGraceMinutes" INTEGER NOT NULL,
  "overtimeAllowed" BOOLEAN NOT NULL,
  "overtimeThresholdMinutes" INTEGER NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ShiftAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Shift_companyId_code_key" ON "Shift"("companyId", "code");
CREATE INDEX "Shift_companyId_isActive_idx" ON "Shift"("companyId", "isActive");
CREATE UNIQUE INDEX "ShiftAssignment_companyId_employeeId_workDate_key" ON "ShiftAssignment"("companyId", "employeeId", "workDate");
CREATE INDEX "ShiftAssignment_companyId_workDate_idx" ON "ShiftAssignment"("companyId", "workDate");
CREATE INDEX "ShiftAssignment_employeeId_workDate_idx" ON "ShiftAssignment"("employeeId", "workDate");
CREATE INDEX "ShiftAssignment_shiftId_idx" ON "ShiftAssignment"("shiftId");
CREATE UNIQUE INDEX "Attendance_shiftAssignmentId_key" ON "Attendance"("shiftAssignmentId");
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftAssignment" ADD CONSTRAINT "ShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_shiftAssignmentId_fkey" FOREIGN KEY ("shiftAssignmentId") REFERENCES "ShiftAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
