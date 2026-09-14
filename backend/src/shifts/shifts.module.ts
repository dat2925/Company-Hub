import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { ShiftAssignmentsController, ShiftsController } from './shifts.controller';
import { ShiftAssignmentsService, ShiftsService } from './shifts.service';

@Module({ controllers: [ShiftsController, ShiftAssignmentsController], providers: [RolesGuard, ShiftsService, ShiftAssignmentsService] })
export class ShiftsModule {}
