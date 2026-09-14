export type Role='SUPER_ADMIN'|'ADMIN'|'EMPLOYEE';
export interface DepartmentPermission{canCreate:boolean;canUpdate:boolean;canDelete:boolean;canAssignPosition:boolean}
export interface User{id:string;email:string;role:Role;companyId:string|null;employee?:{id?:string;employeeCode?:string;fullName:string;departmentId?:string|null;departmentPermission?:DepartmentPermission|null;department?:{id?:string;name:string}|null;position?:{id?:string;name:string}|null}|null;company?:{name:string}|null}
export interface Item{ id:string; [key:string]:string|number|boolean|null|undefined|object }
export interface Field{name:string;type?:'text'|'email'|'textarea'|'date'|'datetime-local'|'select'|'password';required?:boolean;options?:string[];lookup?:'departments'|'positions'|'projects'|'employees'}

// --- Talent Intelligence Types ---
export type SkillSource = 'SELF_DECLARED' | 'MANAGER_VERIFIED' | 'PROJECT_EVIDENCE' | 'CERTIFICATION';
export type TalentOpportunityType = 'PROJECT_ROLE' | 'INTERNAL_POSITION' | 'SHORT_TERM_MISSION';
export type TalentOpportunityStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'CANCELLED';
export type ApplicationStatus = 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Skill extends Item {
  companyId: string; code: string; name: string;
  category: string | null; description: string | null; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface EmployeeSummary {
  id: string; employeeCode: string; fullName: string;
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
}

export interface EmployeeSkill extends Item {
  employeeId: string; skillId: string;
  level: 1 | 2 | 3 | 4 | 5; yearsExperience: number;
  source: SkillSource; evidence: string | null;
  verifiedAt: string | null; lastUsedAt: string | null;
  skill: Skill;
}

export interface SkillRequirement extends Item {
  skillId: string; minimumLevel: number;
  weight: number; isRequired: boolean; skill: Skill;
}

export interface TalentMatch {
  employee: EmployeeSummary & { skills: EmployeeSkill[] };
  matchScore: number;
  skillFitScore: number;
  availabilityScore: number;
  meetsAllRequiredSkills: boolean;
  missingRequiredSkills: Array<{
    skillId: string; code?: string; name?: string;
    currentLevel: number; requiredLevel: number;
  }>;
  workload: { openIssueCount: number; overtimeMinutes30Days: number };
}

export interface TalentOpportunity extends Item {
  title: string; description: string | null;
  type: TalentOpportunityType; status: TalentOpportunityStatus;
  openings: number; startDate: string | null; endDate: string | null;
  projectId?: string | null;
  project: { id: string; code: string; name: string } | null;
  requirements: SkillRequirement[];
  _count: { applications: number };
  createdAt: string; updatedAt: string;
}

export interface TalentApplication extends Item {
  opportunityId: string;
  employeeId: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  employee?: EmployeeSummary & { skills: EmployeeSkill[] };
  opportunity?: TalentOpportunity;
}
