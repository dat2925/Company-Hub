import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../common/types';
import { ChangePasswordDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}
  private safeUser(user: { id: string; email: string; role: string; companyId: string | null; isActive: boolean; createdAt?: Date }) {
    return { id: user.id, email: user.email, role: user.role, companyId: user.companyId, isActive: user.isActive, createdAt: user.createdAt };
  }
  private async tokens(user: { id: string; email: string; role: string; companyId: string | null }) {
    const payload = { sub: user.id, email: user.email, role: user.role, companyId: user.companyId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: '15m' }),
      this.jwt.signAsync(payload, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: '7d' }),
    ]);
    await this.prisma.refreshToken.create({ data: { userId: user.id, tokenHash: await argon2.hash(refreshToken), expiresAt: new Date(Date.now() + 7 * 86400000) } });
    return { accessToken, refreshToken };
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user?.isActive || !(await argon2.verify(user.passwordHash, dto.password))) throw new UnauthorizedException('Invalid email or password');
    const profile = await this.me({ id: user.id, email: user.email, role: user.role, companyId: user.companyId });
    return { user: { ...this.safeUser(user), employee: profile?.employee ?? null, company: profile?.company ?? null }, ...(await this.tokens(user)) };
  }
  async refresh(token: string) {
    let payload: { sub: string };
    try { payload = await this.jwt.verifyAsync(token, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') }); }
    catch { throw new UnauthorizedException('Invalid refresh token'); }
    const records = await this.prisma.refreshToken.findMany({ where: { userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } } });
    const record = await Promise.all(records.map(async (r) => (await argon2.verify(r.tokenHash, token)) ? r : null)).then((v) => v.find(Boolean));
    if (!record) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.isActive) throw new UnauthorizedException('Account is inactive');
    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    return this.tokens(user);
  }
  async logout(token: string) {
    const records = await this.prisma.refreshToken.findMany({ where: { revokedAt: null, expiresAt: { gt: new Date() } } });
    const record = await Promise.all(records.map(async (r) => (await argon2.verify(r.tokenHash, token)) ? r : null)).then((v) => v.find(Boolean));
    if (record) await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    return { message: 'Logged out' };
  }
  async me(user: AuthUser) {
    return this.prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, role: true, companyId: true, isActive: true, createdAt: true, employee: { include: { departmentPermission: true } }, company: { select: { id: true, name: true, code: true, logoUrl: true } } } });
  }
  async changePassword(user: AuthUser, dto: ChangePasswordDto) {
    const current = await this.prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    if (!(await argon2.verify(current.passwordHash, dto.currentPassword))) throw new UnauthorizedException('Current password is incorrect');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { passwordHash: await argon2.hash(dto.newPassword) } }),
      this.prisma.refreshToken.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    return { message: 'Password changed' };
  }
}
