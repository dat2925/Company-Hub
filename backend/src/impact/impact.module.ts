import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { ImpactController } from './impact.controller';
import { ImpactService } from './impact.service';

@Module({ controllers: [ImpactController], providers: [RolesGuard, ImpactService] })
export class ImpactModule {}
