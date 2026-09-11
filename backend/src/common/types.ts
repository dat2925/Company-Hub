import { Role } from '@prisma/client';
export interface AuthUser { id: string; email: string; role: Role; companyId: string | null }
export interface RequestWithUser extends Request { user: AuthUser }
