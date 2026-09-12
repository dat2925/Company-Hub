CREATE TABLE "DepartmentPermission" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "departmentId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canUpdate" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canAssignPosition" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DepartmentPermission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DepartmentPermission_employeeId_key" ON "DepartmentPermission"("employeeId");
CREATE INDEX "DepartmentPermission_companyId_departmentId_idx" ON "DepartmentPermission"("companyId", "departmentId");
ALTER TABLE "DepartmentPermission" ADD CONSTRAINT "DepartmentPermission_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DepartmentPermission" ADD CONSTRAINT "DepartmentPermission_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DepartmentPermission" ADD CONSTRAINT "DepartmentPermission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
