import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from '../src/common/roles.guard';
describe('RolesGuard',()=>{
  it('allows a matching role and rejects another role',()=>{const reflector={getAllAndOverride:jest.fn().mockReturnValue([Role.ADMIN])} as unknown as Reflector;const guard=new RolesGuard(reflector);const context=(role:Role)=>({getHandler:()=>null,getClass:()=>null,switchToHttp:()=>({getRequest:()=>({user:{role}})})}) as unknown as ExecutionContext;expect(guard.canActivate(context(Role.ADMIN))).toBe(true);expect(guard.canActivate(context(Role.EMPLOYEE))).toBe(false)});
});
