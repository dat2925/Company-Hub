import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from '../src/auth/auth.service';
describe('AuthService',()=>{
  it('logs in an active user without exposing passwordHash',async()=>{const user={id:'u',email:'u@a.com',passwordHash:await argon2.hash('Password1'),role:'ADMIN',companyId:'c',isActive:true};const prisma={user:{findUnique:jest.fn().mockResolvedValue(user)},refreshToken:{create:jest.fn().mockResolvedValue({})}};const jwt={signAsync:jest.fn().mockResolvedValueOnce('access').mockResolvedValueOnce('refresh')} as unknown as JwtService;const config={getOrThrow:jest.fn((key:string)=>key)} as unknown as ConfigService;const result=await new AuthService(prisma as never,jwt,config).login({email:user.email,password:'Password1'});expect(result.accessToken).toBe('access');expect(result.user).not.toHaveProperty('passwordHash')});
});
