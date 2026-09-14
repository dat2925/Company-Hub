import { z } from 'zod';

export const impactEntrySchema = z.object({
  type: z.enum([
    'DELIVERY',
    'IMPROVEMENT',
    'CUSTOMER_IMPACT',
    'TEAM_SUPPORT',
    'LEARNING',
    'LEADERSHIP',
    'OTHER'
  ]),
  title: z.string().min(2, 'validation.required'),
  description: z.string().optional(),
  occurredOn: z.string().min(1, 'validation.required'),
  projectId: z.string().optional(),
  sourceIssueId: z.string().optional(),
  metrics: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  visibility: z.enum(['PRIVATE', 'MANAGER', 'COMPANY']),
  isHighlighted: z.boolean().optional()
});

export type ImpactEntryFormValues = z.infer<typeof impactEntrySchema>;

export const recognitionSchema = z.object({
  receiverEmployeeId: z.string().min(1, 'validation.required'),
  skillId: z.string().optional(),
  message: z.string().min(3, 'validation.required'),
  visibility: z.enum(['PRIVATE', 'MANAGER', 'COMPANY'])
});

export type RecognitionFormValues = z.infer<typeof recognitionSchema>;

export const employeeGoalSchema = z.object({
  employeeId: z.string().optional(),
  title: z.string().min(1, 'validation.required'),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().min(1, 'validation.required'),
  targetDate: z.string().optional()
});

export type EmployeeGoalFormValues = z.infer<typeof employeeGoalSchema>;

export const generateReportSchema = z.object({
  period: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'CUSTOM']),
  periodStart: z.string().min(1, 'validation.required'),
  periodEnd: z.string().min(1, 'validation.required'),
  selfReflection: z.string().optional()
});

export type GenerateReportFormValues = z.infer<typeof generateReportSchema>;

export const reviewReportSchema = z.object({
  managerComment: z.string().min(2, 'validation.required')
});

export type ReviewReportFormValues = z.infer<typeof reviewReportSchema>;
