import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/roles.guard';
import { SkillsController, TalentIntelligenceController, TalentOpportunitiesController } from './talent.controller';
import { SkillsService, TalentIntelligenceService, TalentOpportunitiesService } from './talent.service';

@Module({ controllers: [SkillsController, TalentIntelligenceController, TalentOpportunitiesController], providers: [RolesGuard, SkillsService, TalentIntelligenceService, TalentOpportunitiesService] })
export class TalentModule {}
