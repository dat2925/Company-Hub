import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { PayrollController, SalaryProfilesController } from './payroll.controller';
import { PayrollService } from './payroll.service';

@Module({ controllers: [SalaryProfilesController, PayrollController], providers: [RolesGuard, PayrollService] })
export class PayrollModule {}
