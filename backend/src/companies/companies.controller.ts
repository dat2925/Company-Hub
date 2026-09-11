import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from '../common/pagination.dto';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyAdminDto, CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
@ApiTags('Companies') @ApiBearerAuth() @Controller('companies') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.SUPER_ADMIN)
export class CompaniesController {
  constructor(private service: CompaniesService) {}
  @Get() list(@Query() q: PaginationDto) { return this.service.list(q); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Post() create(@Body() dto: CreateCompanyDto) { return this.service.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/admin') admin(@Param('id') id: string, @Body() dto: CreateCompanyAdminDto) { return this.service.createAdmin(id, dto); }
}
