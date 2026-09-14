CREATE TYPE "ImpactEntryType" AS ENUM ('DELIVERY', 'IMPROVEMENT', 'CUSTOMER_IMPACT', 'TEAM_SUPPORT', 'LEARNING', 'LEADERSHIP', 'OTHER');
CREATE TYPE "ImpactVisibility" AS ENUM ('PRIVATE', 'MANAGER', 'COMPANY');
CREATE TYPE "ImpactReportPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM');
CREATE TYPE "ImpactReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');
CREATE TYPE "EmployeeGoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE "ImpactEntry" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "projectId" UUID,
  "sourceIssueId" UUID,
  "type" "ImpactEntryType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "occurredOn" DATE NOT NULL,
  "metrics" JSONB,
  "visibility" "ImpactVisibility" NOT NULL DEFAULT 'MANAGER',
  "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ImpactEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ImpactReport" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "reviewerId" UUID,
  "period" "ImpactReportPeriod" NOT NULL,
  "periodStart" DATE NOT NULL,
  "periodEnd" DATE NOT NULL,
  "status" "ImpactReportStatus" NOT NULL DEFAULT 'DRAFT',
  "snapshot" JSONB NOT NULL,
  "selfReflection" TEXT,
  "managerComment" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ImpactReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeGoal" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "status" "EmployeeGoalStatus" NOT NULL DEFAULT 'ACTIVE',
  "startDate" DATE NOT NULL,
  "targetDate" DATE,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeGoal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Recognition" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "senderEmployeeId" UUID NOT NULL,
  "receiverEmployeeId" UUID NOT NULL,
  "skillId" UUID,
  "message" TEXT NOT NULL,
  "visibility" "ImpactVisibility" NOT NULL DEFAULT 'COMPANY',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Recognition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ImpactEntry_employeeId_sourceIssueId_key" ON "ImpactEntry"("employeeId", "sourceIssueId");
CREATE INDEX "ImpactEntry_companyId_employeeId_occurredOn_idx" ON "ImpactEntry"("companyId", "employeeId", "occurredOn");
CREATE INDEX "ImpactEntry_companyId_visibility_occurredOn_idx" ON "ImpactEntry"("companyId", "visibility", "occurredOn");
CREATE INDEX "ImpactEntry_projectId_idx" ON "ImpactEntry"("projectId");
CREATE INDEX "ImpactReport_companyId_employeeId_periodStart_periodEnd_idx" ON "ImpactReport"("companyId", "employeeId", "periodStart", "periodEnd");
CREATE INDEX "ImpactReport_companyId_status_submittedAt_idx" ON "ImpactReport"("companyId", "status", "submittedAt");
CREATE INDEX "EmployeeGoal_companyId_employeeId_status_idx" ON "EmployeeGoal"("companyId", "employeeId", "status");
CREATE INDEX "EmployeeGoal_companyId_targetDate_idx" ON "EmployeeGoal"("companyId", "targetDate");
CREATE INDEX "Recognition_companyId_receiverEmployeeId_createdAt_idx" ON "Recognition"("companyId", "receiverEmployeeId", "createdAt");
CREATE INDEX "Recognition_companyId_visibility_createdAt_idx" ON "Recognition"("companyId", "visibility", "createdAt");
CREATE INDEX "Recognition_senderEmployeeId_idx" ON "Recognition"("senderEmployeeId");

ALTER TABLE "ImpactEntry" ADD CONSTRAINT "ImpactEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImpactEntry" ADD CONSTRAINT "ImpactEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImpactEntry" ADD CONSTRAINT "ImpactEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ImpactEntry" ADD CONSTRAINT "ImpactEntry_sourceIssueId_fkey" FOREIGN KEY ("sourceIssueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ImpactReport" ADD CONSTRAINT "ImpactReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImpactReport" ADD CONSTRAINT "ImpactReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImpactReport" ADD CONSTRAINT "ImpactReport_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmployeeGoal" ADD CONSTRAINT "EmployeeGoal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeGoal" ADD CONSTRAINT "EmployeeGoal_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recognition" ADD CONSTRAINT "Recognition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recognition" ADD CONSTRAINT "Recognition_senderEmployeeId_fkey" FOREIGN KEY ("senderEmployeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recognition" ADD CONSTRAINT "Recognition_receiverEmployeeId_fkey" FOREIGN KEY ("receiverEmployeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Recognition" ADD CONSTRAINT "Recognition_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
