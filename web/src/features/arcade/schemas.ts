import { z } from 'zod';

export const createChallengeSchema = z.object({
  title: z.string().min(1, 'validation.required'),
  description: z.string().optional(),
  type: z.enum(['TRIVIA', 'POLL', 'CAPTION', 'GUESS_COLLEAGUE']),
  question: z.string().min(1, 'validation.required'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  points: z.number().min(1).max(1000),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  startsAt: z.string().min(1, 'validation.required'),
  endsAt: z.string().min(1, 'validation.required'),
}).superRefine((data, ctx) => {
  if (data.startsAt && data.endsAt && new Date(data.startsAt) >= new Date(data.endsAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'startsAt must be before endsAt',
      path: ['endsAt'],
    });
  }

  if (data.type === 'TRIVIA' || data.type === 'GUESS_COLLEAGUE') {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Require at least 2 options',
        path: ['options'],
      });
    }
    if (!data.correctAnswer || (data.options && !data.options.includes(data.correctAnswer))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Correct answer must be one of the options',
        path: ['correctAnswer'],
      });
    }
  }

  if (data.type === 'POLL') {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Require at least 2 options',
        path: ['options'],
      });
    }
  }

  if (data.options) {
    const uniqueOptions = new Set(data.options);
    if (uniqueOptions.size !== data.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Options must be unique',
        path: ['options'],
      });
    }
  }
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;

export const createMissionSchema = z.object({
  title: z.string().min(1, 'validation.required'),
  description: z.string().optional(),
  points: z.number().min(1).max(1000),
  requiresProof: z.boolean(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
  startsAt: z.string().min(1, 'validation.required'),
  endsAt: z.string().min(1, 'validation.required'),
}).superRefine((data, ctx) => {
  if (data.startsAt && data.endsAt && new Date(data.startsAt) >= new Date(data.endsAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'startsAt must be before endsAt',
      path: ['endsAt'],
    });
  }
});

export type CreateMissionInput = z.infer<typeof createMissionSchema>;

export const submitMissionSchema = z.object({
  proofText: z.string().optional(),
  proofUrl: z.string().url().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (!data.proofText && (!data.proofUrl || data.proofUrl === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Proof text or URL is required',
      path: ['proofText'],
    });
  }
});

export type SubmitMissionInput = z.infer<typeof submitMissionSchema>;

export const reviewMissionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  managerComment: z.string().optional(),
});

export type ReviewMissionInput = z.infer<typeof reviewMissionSchema>;
