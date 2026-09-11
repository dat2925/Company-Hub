import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PaginationDto, pageMeta } from '../common/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyAdminDto, CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}
  async list(query: PaginationDto) {
    const where: Prisma.CompanyWhereInput = query.search ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { code: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }] } : {};
    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.company.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.company.count({ where }),
    ]);
    return { data, meta: pageMeta(query.page, query.pageSize, totalItems) };
  }
  async get(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id }, include: { _count: { select: { users: true, employees: true, departments: true } } } });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }
  create(dto: CreateCompanyDto) { return this.prisma.company.create({ data: { ...dto, code: dto.code.toUpperCase() } }); }
  async update(id: string, dto: UpdateCompanyDto) { await this.get(id); return this.prisma.company.update({ where: { id }, data: { ...dto, code: dto.code?.toUpperCase() } }); }
  async remove(id: string) { await this.get(id); return this.prisma.company.update({ where: { id }, data: { status: 'INACTIVE' } }); }
  async createAdmin(companyId: string, dto: CreateCompanyAdminDto) {
    await this.get(companyId);
    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { companyId, email: dto.email.toLowerCase(), passwordHash, role: 'ADMIN' } });
      await tx.employee.create({ data: { companyId, userId: user.id, employeeCode: `ADM-${Date.now()}`, fullName: dto.fullName, email: dto.email.toLowerCase() } });
      return { id: user.id, companyId: user.companyId, email: user.email, role: user.role, isActive: user.isActive };
    });
  }
}
