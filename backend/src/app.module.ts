import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { ResourcesModule } from './resources/resources.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ApiResponseInterceptor } from './common/api-response.interceptor';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { ShiftsModule } from './shifts/shifts.module';
import { TalentModule } from './talent/talent.module';
import { ImpactModule } from './impact/impact.module';
import { ArcadeModule } from './arcade/arcade.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, CompaniesModule, ResourcesModule, DashboardModule, AttendanceModule, PayrollModule, ShiftsModule, TalentModule, ImpactModule, ArcadeModule, ChatModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ApiResponseInterceptor },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
