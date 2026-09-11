import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { RolesGuard } from '../common/roles.guard';
@Module({ controllers: [CompaniesController], providers: [CompaniesService, RolesGuard] })
export class CompaniesModule {}
