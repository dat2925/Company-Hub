import { z } from 'zod';

export const createDirectSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  icon: z.string().max(16).optional(),
  theme: z.enum(['DEFAULT', 'OCEAN', 'FOREST', 'SUNSET', 'LAVENDER', 'MIDNIGHT'] as const).optional(),
});
export type CreateDirectInput = z.infer<typeof createDirectSchema>;

export const createGroupSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must be at most 100 characters'),
  memberIds: z.array(z.string()).min(1, 'At least 1 member is required').max(99, 'At most 99 members allowed'),
  icon: z.string().max(16, 'Icon must be at most 16 characters').optional(),
  theme: z.enum(['DEFAULT', 'OCEAN', 'FOREST', 'SUNSET', 'LAVENDER', 'MIDNIGHT'] as const).optional(),
});
export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const updateConversationSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  icon: z.string().max(16).optional(),
  theme: z.enum(['DEFAULT', 'OCEAN', 'FOREST', 'SUNSET', 'LAVENDER', 'MIDNIGHT'] as const).optional(),
});
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

export const sendMessageSchema = z.object({
  type: z.enum(['TEXT', 'IMAGE', 'FILE']).optional().default('TEXT'),
  content: z.string().max(5000, 'Message is too long').optional(),
  attachmentUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  attachmentName: z.string().optional(),
  replyToId: z.string().optional(),
}).refine((data) => {
  if (data.type === 'TEXT') {
    return !!data.content && data.content.trim().length > 0;
  }
  if (data.type === 'IMAGE' || data.type === 'FILE') {
    return !!data.attachmentUrl;
  }
  return true;
}, {
  message: 'Message content or attachment is required',
  path: ['content'],
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
