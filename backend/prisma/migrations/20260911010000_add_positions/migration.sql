CREATE TABLE "Position" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Position_companyId_code_key" ON "Position"("companyId", "code");
CREATE INDEX "Position_companyId_name_idx" ON "Position"("companyId", "name");
CREATE INDEX "Position_departmentId_idx" ON "Position"("departmentId");
ALTER TABLE "Position" ADD CONSTRAINT "Position_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Position" ("id", "companyId", "departmentId", "code", "name", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "companyId", "departmentId", 'MIG-' || upper(substr(md5("companyId"::text || "departmentId"::text || "position"), 1, 12)), "position", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Employee"
WHERE "departmentId" IS NOT NULL AND "position" IS NOT NULL AND trim("position") <> ''
GROUP BY "companyId", "departmentId", "position";

ALTER TABLE "Employee" ADD COLUMN "positionId" UUID;
UPDATE "Employee" employee SET "positionId" = position."id" FROM "Position" position
WHERE employee."companyId" = position."companyId" AND employee."departmentId" = position."departmentId" AND employee."position" = position."name";
ALTER TABLE "Employee" DROP COLUMN "position";
CREATE INDEX "Employee_positionId_idx" ON "Employee"("positionId");
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
