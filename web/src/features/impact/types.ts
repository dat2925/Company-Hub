import { Item, Skill } from '@/types';

export type ImpactEntryType =
  | 'DELIVERY'
  | 'IMPROVEMENT'
  | 'CUSTOMER_IMPACT'
  | 'TEAM_SUPPORT'
  | 'LEARNING'
  | 'LEADERSHIP'
  | 'OTHER';

export type ImpactVisibility = 'PRIVATE' | 'MANAGER' | 'COMPANY';
export type ImpactReportPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'CUSTOM';
export type ImpactReportStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWED';
export type EmployeeGoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type EmployeeBrief = {
  id: string;
  employeeCode: string;
  fullName: string;
  department: { id: string; name: string } | null;
  position: { id: string; name: string } | null;
};

export interface ImpactEntry extends Item {
  employeeId: string;
  type: ImpactEntryType;
  title: string;
  description: string | null;
  occurredOn: string;
  projectId: string | null;
  sourceIssueId: string | null;
  metrics: Record<string, string | number | boolean>;
  visibility: ImpactVisibility;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
  employee: EmployeeBrief;
  project: { id: string; code: string; name: string } | null;
  sourceIssue: { id: string; title: string } | null;
}

export interface Recognition extends Item {
  senderId: string;
  receiverId: string;
  skillId: string | null;
  message: string;
  visibility: ImpactVisibility;
  createdAt: string;
  sender: EmployeeBrief;
  receiver: EmployeeBrief;
  skill: Skill | null;
}

export interface EmployeeGoal extends Item {
  employeeId: string;
  title: string;
  description: string | null;
  progress: number;
  status: EmployeeGoalStatus;
  startDate: string;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
  employee: EmployeeBrief;
}

export interface ImpactReport extends Item {
  employeeId: string;
  period: ImpactReportPeriod;
  periodStart: string;
  periodEnd: string;
  status: ImpactReportStatus;
  selfReflection: string | null;
  managerComment: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  generatedAt: string;
  snapshot: {
    generatedAt: string;
    summary: Record<string, unknown>;
    entries: ImpactEntry[];
    completedIssues: unknown[];
    recognitions: Recognition[];
    goals: EmployeeGoal[];
  };
  createdAt: string;
  updatedAt: string;
  employee: EmployeeBrief;
  reviewer: EmployeeBrief | null;
}

export interface CompletedIssue {
  id: string;
  projectId: string;
  title: string;
  priority: string;
  completedAtApproximation: string;
  project: { id: string; code: string; name: string };
}

export interface DashboardSummary {
  employee: EmployeeBrief;
  period: { from: string; to: string };
  summary: {
    entryCount: number;
    highlightedCount: number;
    entriesByType: Record<string, number>;
    completedIssueCount: number;
    highPriorityIssueCount: number;
    contributedProjectCount: number;
    recognitionCount: number;
    activeGoalCount: number;
    completedGoalCount: number;
    workedMinutes: number;
    overtimeMinutes: number;
  };
  entries: ImpactEntry[];
  completedIssues: CompletedIssue[];
  recognitions: Recognition[];
  goals: EmployeeGoal[];
}

export interface ImpactSuggestion {
  suggestionType: 'COMPLETED_ISSUE';
  sourceIssueId: string;
  projectId: string;
  title: string;
  priority: string;
  completedAtApproximation: string;
  project: { id: string; code: string; name: string };
}

export type FeedItem =
  | { kind: 'IMPACT_ENTRY'; occurredAt: string; item: ImpactEntry }
  | { kind: 'RECOGNITION'; occurredAt: string; item: Recognition };
