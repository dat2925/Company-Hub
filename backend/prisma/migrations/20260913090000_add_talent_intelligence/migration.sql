CREATE TYPE "SkillSource" AS ENUM ('SELF_DECLARED', 'MANAGER_VERIFIED', 'PROJECT_EVIDENCE', 'CERTIFICATION');
CREATE TYPE "TalentOpportunityType" AS ENUM ('PROJECT_ROLE', 'INTERNAL_POSITION', 'SHORT_TERM_MISSION');
CREATE TYPE "TalentOpportunityStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED');
CREATE TYPE "OpportunityApplicationStatus" AS ENUM ('PENDING', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

CREATE TABLE "Skill" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeSkill" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "skillId" UUID NOT NULL,
  "level" INTEGER NOT NULL,
  "yearsExperience" INTEGER NOT NULL DEFAULT 0,
  "source" "SkillSource" NOT NULL DEFAULT 'SELF_DECLARED',
  "evidence" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "lastUsedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectSkillRequirement" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "projectId" UUID NOT NULL,
  "skillId" UUID NOT NULL,
  "minimumLevel" INTEGER NOT NULL DEFAULT 1,
  "weight" INTEGER NOT NULL DEFAULT 1,
  "isRequired" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectSkillRequirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TalentOpportunity" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "projectId" UUID,
  "createdById" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" "TalentOpportunityType" NOT NULL,
  "status" "TalentOpportunityStatus" NOT NULL DEFAULT 'DRAFT',
  "openings" INTEGER NOT NULL DEFAULT 1,
  "startDate" DATE,
  "endDate" DATE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TalentOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OpportunitySkillRequirement" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "opportunityId" UUID NOT NULL,
  "skillId" UUID NOT NULL,
  "minimumLevel" INTEGER NOT NULL DEFAULT 1,
  "weight" INTEGER NOT NULL DEFAULT 1,
  "isRequired" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OpportunitySkillRequirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OpportunityApplication" (
  "id" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "opportunityId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "status" "OpportunityApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OpportunityApplication_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Skill_companyId_code_key" ON "Skill"("companyId", "code");
CREATE INDEX "Skill_companyId_name_idx" ON "Skill"("companyId", "name");
CREATE INDEX "Skill_companyId_category_idx" ON "Skill"("companyId", "category");
CREATE UNIQUE INDEX "EmployeeSkill_employeeId_skillId_key" ON "EmployeeSkill"("employeeId", "skillId");
CREATE INDEX "EmployeeSkill_companyId_skillId_level_idx" ON "EmployeeSkill"("companyId", "skillId", "level");
CREATE INDEX "EmployeeSkill_companyId_employeeId_idx" ON "EmployeeSkill"("companyId", "employeeId");
CREATE UNIQUE INDEX "ProjectSkillRequirement_projectId_skillId_key" ON "ProjectSkillRequirement"("projectId", "skillId");
CREATE INDEX "ProjectSkillRequirement_companyId_projectId_idx" ON "ProjectSkillRequirement"("companyId", "projectId");
CREATE INDEX "ProjectSkillRequirement_companyId_skillId_idx" ON "ProjectSkillRequirement"("companyId", "skillId");
CREATE INDEX "TalentOpportunity_companyId_status_startDate_idx" ON "TalentOpportunity"("companyId", "status", "startDate");
CREATE INDEX "TalentOpportunity_projectId_idx" ON "TalentOpportunity"("projectId");
CREATE UNIQUE INDEX "OpportunitySkillRequirement_opportunityId_skillId_key" ON "OpportunitySkillRequirement"("opportunityId", "skillId");
CREATE INDEX "OpportunitySkillRequirement_companyId_opportunityId_idx" ON "OpportunitySkillRequirement"("companyId", "opportunityId");
CREATE INDEX "OpportunitySkillRequirement_companyId_skillId_idx" ON "OpportunitySkillRequirement"("companyId", "skillId");
CREATE UNIQUE INDEX "OpportunityApplication_opportunityId_employeeId_key" ON "OpportunityApplication"("opportunityId", "employeeId");
CREATE INDEX "OpportunityApplication_companyId_employeeId_status_idx" ON "OpportunityApplication"("companyId", "employeeId", "status");
CREATE INDEX "OpportunityApplication_companyId_opportunityId_status_idx" ON "OpportunityApplication"("companyId", "opportunityId", "status");

ALTER TABLE "Skill" ADD CONSTRAINT "Skill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSkillRequirement" ADD CONSTRAINT "ProjectSkillRequirement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSkillRequirement" ADD CONSTRAINT "ProjectSkillRequirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSkillRequirement" ADD CONSTRAINT "ProjectSkillRequirement_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TalentOpportunity" ADD CONSTRAINT "TalentOpportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TalentOpportunity" ADD CONSTRAINT "TalentOpportunity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TalentOpportunity" ADD CONSTRAINT "TalentOpportunity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OpportunitySkillRequirement" ADD CONSTRAINT "OpportunitySkillRequirement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OpportunitySkillRequirement" ADD CONSTRAINT "OpportunitySkillRequirement_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "TalentOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OpportunitySkillRequirement" ADD CONSTRAINT "OpportunitySkillRequirement_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OpportunityApplication" ADD CONSTRAINT "OpportunityApplication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OpportunityApplication" ADD CONSTRAINT "OpportunityApplication_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "TalentOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OpportunityApplication" ADD CONSTRAINT "OpportunityApplication_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
