import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AuthUser } from '../common/types';
import { ArcadeService } from './arcade.service';
import { ArcadeContentQueryDto, CreateArcadeChallengeDto, CreateArcadeMissionDto, LeaderboardQueryDto, MatchmakeRoomDto, MissionQueryDto, MissionSubmissionQueryDto, PlayArcadeChallengeDto, ReviewMissionSubmissionDto, SubmitArcadeMissionDto, UpdateArcadeChallengeDto, UpdateArcadeMissionDto } from './dto/arcade.dto';

@ApiTags('Office Arcade')
@ApiBearerAuth()
@Controller('arcade')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EMPLOYEE)
export class ArcadeController {
  constructor(private readonly service: ArcadeService) {}

  @Get('home') @Roles(Role.EMPLOYEE) home(@CurrentUser() user: AuthUser) { return this.service.home(user); }
  @Get('profile') @Roles(Role.EMPLOYEE) profile(@CurrentUser() user: AuthUser) { return this.service.profile(user); }
  @Get('leaderboard') leaderboard(@CurrentUser() user: AuthUser, @Query() query: LeaderboardQueryDto) { return this.service.leaderboard(user, query); }

  @Get('challenges') challenges(@CurrentUser() user: AuthUser, @Query() query: ArcadeContentQueryDto) { return this.service.challenges(user, query); }
  @Post('challenges') @Roles(Role.ADMIN) createChallenge(@CurrentUser() user: AuthUser, @Body() dto: CreateArcadeChallengeDto) { return this.service.createChallenge(user, dto); }
  @Patch('challenges/:id') @Roles(Role.ADMIN) updateChallenge(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateArcadeChallengeDto) { return this.service.updateChallenge(user, id, dto); }
  @Post('challenges/:id/publish') @Roles(Role.ADMIN) publishChallenge(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.publishChallenge(user, id); }
  @Post('challenges/:id/close') @Roles(Role.ADMIN) closeChallenge(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.closeChallenge(user, id); }
  @Delete('challenges/:id') @Roles(Role.ADMIN) removeChallenge(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.removeChallenge(user, id); }
  @Post('challenges/:id/play') @Roles(Role.EMPLOYEE) play(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: PlayArcadeChallengeDto) { return this.service.play(user, id, dto); }
  @Get('challenges/:id/results') results(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.challengeResults(user, id); }

  @Get('missions') missions(@CurrentUser() user: AuthUser, @Query() query: MissionQueryDto) { return this.service.missions(user, query); }
  @Post('missions') @Roles(Role.ADMIN) createMission(@CurrentUser() user: AuthUser, @Body() dto: CreateArcadeMissionDto) { return this.service.createMission(user, dto); }
  @Patch('missions/:id') @Roles(Role.ADMIN) updateMission(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateArcadeMissionDto) { return this.service.updateMission(user, id, dto); }
  @Post('missions/:id/publish') @Roles(Role.ADMIN) publishMission(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.publishMission(user, id); }
  @Post('missions/:id/close') @Roles(Role.ADMIN) closeMission(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.closeMission(user, id); }
  @Delete('missions/:id') @Roles(Role.ADMIN) removeMission(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.removeMission(user, id); }
  @Post('missions/:id/submit') @Roles(Role.EMPLOYEE) submitMission(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SubmitArcadeMissionDto) { return this.service.submitMission(user, id, dto); }
  @Get('mission-submissions') @Roles(Role.ADMIN) missionSubmissions(@CurrentUser() user: AuthUser, @Query() query: MissionSubmissionQueryDto) { return this.service.missionSubmissions(user, query); }
  @Patch('mission-submissions/:id/review') @Roles(Role.ADMIN) reviewMissionSubmission(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ReviewMissionSubmissionDto) { return this.service.reviewMissionSubmission(user, id, dto); }

  @Get('rooms/current') @Roles(Role.EMPLOYEE) currentRoom(@CurrentUser() user: AuthUser) { return this.service.currentRoom(user); }
  @Post('rooms/matchmake') @Roles(Role.EMPLOYEE) matchmake(@CurrentUser() user: AuthUser, @Body() dto: MatchmakeRoomDto) { return this.service.matchmake(user, dto); }
  @Post('rooms/:id/ready') @Roles(Role.EMPLOYEE) readyRoom(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.readyRoom(user, id); }
  @Post('rooms/:id/leave') @Roles(Role.EMPLOYEE) leaveRoom(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.leaveRoom(user, id); }
  @Post('rooms/:id/finish') @Roles(Role.EMPLOYEE) finishRoom(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.service.finishRoom(user, id); }
}
