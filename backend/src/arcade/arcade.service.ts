import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ArcadeChallengeType, ArcadeContentStatus, ArcadeRoomStatus, ArcadeSubmissionStatus, Prisma, Role } from '@prisma/client';
import { pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { calculatePlayStreak, deriveArcadeBadges, scoreChallenge } from './arcade-scoring';
import { ArcadeContentQueryDto, ArcadeLeaderboardPeriod, CreateArcadeChallengeDto, CreateArcadeMissionDto, LeaderboardQueryDto, MatchmakeRoomDto, MissionQueryDto, MissionSubmissionQueryDto, PlayArcadeChallengeDto, ReviewMissionSubmissionDto, SubmitArcadeMissionDto, UpdateArcadeChallengeDto, UpdateArcadeMissionDto } from './dto/arcade.dto';

const employeeSelect = {
  id: true,
  employeeCode: true,
  fullName: true,
  department: { select: { id: true, name: true } },
  position: { select: { id: true, name: true } },
} as const;

const roomInclude = {
  members: {
    where: { leftAt: null },
    include: { employee: { select: employeeSelect } },
    orderBy: { joinedAt: 'asc' as const },
  },
} as const;

const paging = (query: { page: number; pageSize: number }) => ({
  skip: (query.page - 1) * query.pageSize,
  take: query.pageSize,
});

@Injectable()
export class ArcadeService {
  constructor(private readonly prisma: PrismaService) {}

  private async currentEmployee(user: AuthUser) {
    const employee = await this.prisma.employee.findFirst({
      where: { companyId: user.companyId!, userId: user.id },
      select: employeeSelect,
    });
    if (!employee) throw new ForbiddenException('Your account is not linked to an employee');
    return employee;
  }

  private validateChallenge(dto: CreateArcadeChallengeDto | UpdateArcadeChallengeDto, current?: { startsAt: Date; endsAt: Date; type: ArcadeChallengeType; options: Prisma.JsonValue; correctAnswer: string | null }) {
    const type = dto.type ?? current?.type;
    const options = dto.options ?? (Array.isArray(current?.options) ? current.options.map(String) : undefined);
    const correctAnswer = dto.correctAnswer ?? current?.correctAnswer;
    const startsAt = dto.startsAt ? new Date(dto.startsAt) : current?.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : current?.endsAt;
    if (!startsAt || !endsAt || endsAt <= startsAt) throw new BadRequestException('End time must be after start time');
    if ((type === ArcadeChallengeType.TRIVIA || type === ArcadeChallengeType.GUESS_COLLEAGUE) && (!options || options.length < 2 || !correctAnswer)) {
      throw new BadRequestException('Trivia challenges require at least two options and a correct answer');
    }
    if (type === ArcadeChallengeType.POLL && (!options || options.length < 2)) throw new BadRequestException('Polls require at least two options');
    if (options) {
      const normalized = options.map((option) => option.trim().toLocaleLowerCase());
      if (normalized.some((option) => !option) || new Set(normalized).size !== normalized.length) throw new BadRequestException('Options must be non-empty and unique');
      if (correctAnswer && !normalized.includes(correctAnswer.trim().toLocaleLowerCase())) throw new BadRequestException('Correct answer must match one option');
    }
  }

  private validateMission(dto: CreateArcadeMissionDto | UpdateArcadeMissionDto, current?: { startsAt: Date; endsAt: Date }) {
    const startsAt = dto.startsAt ? new Date(dto.startsAt) : current?.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : current?.endsAt;
    if (!startsAt || !endsAt || endsAt <= startsAt) throw new BadRequestException('End time must be after start time');
  }

  async challenges(user: AuthUser, query: ArcadeContentQueryDto) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : undefined;
    const now = new Date();
    const where: Prisma.ArcadeChallengeWhereInput = {
      companyId: user.companyId!,
      ...(employee ? { status: ArcadeContentStatus.PUBLISHED, startsAt: { lte: now } } : query.status ? { status: query.status } : {}),
      ...(query.type && { type: query.type }),
      ...(query.search && { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { question: { contains: query.search, mode: 'insensitive' } }] }),
    };
    const include = employee
      ? { plays: { where: { employeeId: employee.id }, take: 1 } }
      : { _count: { select: { plays: true } } };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.arcadeChallenge.findMany({ where, ...paging(query), include, orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }] }),
      this.prisma.arcadeChallenge.count({ where }),
    ]);
    const data = employee
      ? rows.map((row) => {
          const challenge = row as typeof row & { plays: Array<{ id: string; answer: string; isCorrect: boolean | null; pointsAwarded: number; durationMs: number | null; createdAt: Date }> };
          const play = challenge.plays[0] ?? null;
          return { ...challenge, correctAnswer: undefined, plays: undefined, play, hasPlayed: Boolean(play), isPlayable: !play && challenge.endsAt >= now };
        })
      : rows;
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async createChallenge(user: AuthUser, dto: CreateArcadeChallengeDto) {
    this.validateChallenge(dto);
    const { startsAt, endsAt, options, ...data } = dto;
    return this.prisma.arcadeChallenge.create({
      data: { ...data, options: options as Prisma.InputJsonValue | undefined, startsAt: new Date(startsAt), endsAt: new Date(endsAt), companyId: user.companyId!, createdById: user.id },
    });
  }

  private async draftChallenge(user: AuthUser, id: string) {
    const challenge = await this.prisma.arcadeChallenge.findFirst({ where: { id, companyId: user.companyId! } });
    if (!challenge) throw new NotFoundException('Arcade challenge not found');
    if (challenge.status !== ArcadeContentStatus.DRAFT) throw new ConflictException('Only draft challenges can be edited or deleted');
    return challenge;
  }

  async updateChallenge(user: AuthUser, id: string, dto: UpdateArcadeChallengeDto) {
    const current = await this.draftChallenge(user, id);
    this.validateChallenge(dto, current);
    const { startsAt, endsAt, options, ...data } = dto;
    return this.prisma.arcadeChallenge.update({
      where: { id },
      data: { ...data, ...(options && { options: options as Prisma.InputJsonValue }), ...(startsAt && { startsAt: new Date(startsAt) }), ...(endsAt && { endsAt: new Date(endsAt) }) },
    });
  }

  async publishChallenge(user: AuthUser, id: string) {
    const current = await this.draftChallenge(user, id);
    this.validateChallenge({}, current);
    return this.prisma.arcadeChallenge.update({ where: { id }, data: { status: ArcadeContentStatus.PUBLISHED } });
  }

  async closeChallenge(user: AuthUser, id: string) {
    const challenge = await this.prisma.arcadeChallenge.findFirst({ where: { id, companyId: user.companyId! } });
    if (!challenge) throw new NotFoundException('Arcade challenge not found');
    if (challenge.status !== ArcadeContentStatus.PUBLISHED) throw new ConflictException('Only published challenges can be closed');
    return this.prisma.arcadeChallenge.update({ where: { id }, data: { status: ArcadeContentStatus.CLOSED } });
  }

  async removeChallenge(user: AuthUser, id: string) {
    await this.draftChallenge(user, id);
    return this.prisma.arcadeChallenge.delete({ where: { id } });
  }

  async play(user: AuthUser, challengeId: string, dto: PlayArcadeChallengeDto) {
    const employee = await this.currentEmployee(user);
    const now = new Date();
    const challenge = await this.prisma.arcadeChallenge.findFirst({
      where: { id: challengeId, companyId: user.companyId!, status: ArcadeContentStatus.PUBLISHED, startsAt: { lte: now }, endsAt: { gte: now } },
    });
    if (!challenge) throw new NotFoundException('No playable challenge found');
    if (Array.isArray(challenge.options) && !challenge.options.map(String).some((option) => option.trim().toLocaleLowerCase() === dto.answer.trim().toLocaleLowerCase())) {
      throw new BadRequestException('Answer must match one of the challenge options');
    }
    const result = scoreChallenge(challenge.type, dto.answer, challenge.correctAnswer, challenge.points);
    try {
      return await this.prisma.arcadePlay.create({
        data: { companyId: user.companyId!, employeeId: employee.id, challengeId, answer: dto.answer.trim(), durationMs: dto.durationMs, ...result },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('You have already played this challenge');
      throw error;
    }
  }

  async challengeResults(user: AuthUser, challengeId: string) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : undefined;
    const challenge = await this.prisma.arcadeChallenge.findFirst({ where: { id: challengeId, companyId: user.companyId! } });
    if (!challenge) throw new NotFoundException('Arcade challenge not found');
    const ownPlay = employee ? await this.prisma.arcadePlay.findUnique({ where: { challengeId_employeeId: { challengeId, employeeId: employee.id } } }) : null;
    if (employee && !ownPlay) throw new ForbiddenException('Play the challenge before viewing results');
    const answers = await this.prisma.arcadePlay.groupBy({ by: ['answer'], where: { challengeId }, _count: { _all: true }, orderBy: { _count: { answer: 'desc' } } });
    const revealAnswer = user.role === Role.ADMIN || challenge.endsAt <= new Date() || challenge.status === ArcadeContentStatus.CLOSED;
    return { challengeId, totalPlays: answers.reduce((sum, item) => sum + item._count._all, 0), answers: answers.map((item) => ({ answer: item.answer, count: item._count._all })), ownPlay, correctAnswer: revealAnswer ? challenge.correctAnswer : undefined };
  }

  async missions(user: AuthUser, query: MissionQueryDto) {
    const employee = user.role === Role.EMPLOYEE ? await this.currentEmployee(user) : undefined;
    const now = new Date();
    const where: Prisma.ArcadeMissionWhereInput = {
      companyId: user.companyId!,
      ...(employee ? { status: ArcadeContentStatus.PUBLISHED, startsAt: { lte: now } } : query.status ? { status: query.status } : {}),
      ...(query.search && { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] }),
    };
    const include = employee ? { submissions: { where: { employeeId: employee.id }, take: 1 } } : { _count: { select: { submissions: true } } };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.arcadeMission.findMany({ where, ...paging(query), include, orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }] }),
      this.prisma.arcadeMission.count({ where }),
    ]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async createMission(user: AuthUser, dto: CreateArcadeMissionDto) {
    this.validateMission(dto);
    const { startsAt, endsAt, ...data } = dto;
    return this.prisma.arcadeMission.create({ data: { ...data, startsAt: new Date(startsAt), endsAt: new Date(endsAt), companyId: user.companyId!, createdById: user.id } });
  }

  private async draftMission(user: AuthUser, id: string) {
    const mission = await this.prisma.arcadeMission.findFirst({ where: { id, companyId: user.companyId! } });
    if (!mission) throw new NotFoundException('Arcade mission not found');
    if (mission.status !== ArcadeContentStatus.DRAFT) throw new ConflictException('Only draft missions can be edited or deleted');
    return mission;
  }

  async updateMission(user: AuthUser, id: string, dto: UpdateArcadeMissionDto) {
    const current = await this.draftMission(user, id);
    this.validateMission(dto, current);
    const { startsAt, endsAt, ...data } = dto;
    return this.prisma.arcadeMission.update({ where: { id }, data: { ...data, ...(startsAt && { startsAt: new Date(startsAt) }), ...(endsAt && { endsAt: new Date(endsAt) }) } });
  }

  async publishMission(user: AuthUser, id: string) {
    const current = await this.draftMission(user, id);
    this.validateMission({}, current);
    return this.prisma.arcadeMission.update({ where: { id }, data: { status: ArcadeContentStatus.PUBLISHED } });
  }

  async closeMission(user: AuthUser, id: string) {
    const mission = await this.prisma.arcadeMission.findFirst({ where: { id, companyId: user.companyId! } });
    if (!mission) throw new NotFoundException('Arcade mission not found');
    if (mission.status !== ArcadeContentStatus.PUBLISHED) throw new ConflictException('Only published missions can be closed');
    return this.prisma.arcadeMission.update({ where: { id }, data: { status: ArcadeContentStatus.CLOSED } });
  }

  async removeMission(user: AuthUser, id: string) {
    await this.draftMission(user, id);
    return this.prisma.arcadeMission.delete({ where: { id } });
  }

  async submitMission(user: AuthUser, missionId: string, dto: SubmitArcadeMissionDto) {
    const employee = await this.currentEmployee(user);
    const now = new Date();
    const mission = await this.prisma.arcadeMission.findFirst({ where: { id: missionId, companyId: user.companyId!, status: ArcadeContentStatus.PUBLISHED, startsAt: { lte: now }, endsAt: { gte: now } } });
    if (!mission) throw new NotFoundException('No active mission found');
    if (mission.requiresProof && !dto.proofText && !dto.proofUrl) throw new BadRequestException('This mission requires proof');
    const approved = !mission.requiresProof;
    try {
      return await this.prisma.arcadeMissionSubmission.create({
        data: { companyId: user.companyId!, employeeId: employee.id, missionId, ...dto, status: approved ? ArcadeSubmissionStatus.APPROVED : ArcadeSubmissionStatus.PENDING, pointsAwarded: approved ? mission.points : 0, reviewedAt: approved ? now : undefined },
        include: { mission: true, employee: { select: employeeSelect } },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('You have already submitted this mission');
      throw error;
    }
  }

  async missionSubmissions(user: AuthUser, query: MissionSubmissionQueryDto) {
    const where: Prisma.ArcadeMissionSubmissionWhereInput = { companyId: user.companyId!, ...(query.status && { status: query.status }), ...(query.search && { OR: [{ employee: { fullName: { contains: query.search, mode: 'insensitive' } } }, { mission: { title: { contains: query.search, mode: 'insensitive' } } }] }) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.arcadeMissionSubmission.findMany({ where, ...paging(query), include: { mission: true, employee: { select: employeeSelect } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.arcadeMissionSubmission.count({ where }),
    ]);
    return { data, meta: pageMeta(query.page, query.pageSize, total) };
  }

  async reviewMissionSubmission(user: AuthUser, id: string, dto: ReviewMissionSubmissionDto) {
    if (dto.status === ArcadeSubmissionStatus.PENDING) throw new BadRequestException('Review status must be APPROVED or REJECTED');
    const submission = await this.prisma.arcadeMissionSubmission.findFirst({ where: { id, companyId: user.companyId! }, include: { mission: true } });
    if (!submission) throw new NotFoundException('Mission submission not found');
    if (submission.status !== ArcadeSubmissionStatus.PENDING) throw new ConflictException('Only pending submissions can be reviewed');
    return this.prisma.arcadeMissionSubmission.update({
      where: { id },
      data: { status: dto.status, managerComment: dto.managerComment, reviewedAt: new Date(), pointsAwarded: dto.status === ArcadeSubmissionStatus.APPROVED ? submission.mission.points : 0 },
      include: { mission: true, employee: { select: employeeSelect } },
    });
  }

  private periodStart(period: ArcadeLeaderboardPeriod) {
    if (period === ArcadeLeaderboardPeriod.ALL_TIME) return undefined;
    const now = new Date();
    if (period === ArcadeLeaderboardPeriod.MONTHLY) return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
    return start;
  }

  private async employeePoints(employeeId: string, from?: Date) {
    const [plays, missions] = await Promise.all([
      this.prisma.arcadePlay.aggregate({ where: { employeeId, ...(from && { createdAt: { gte: from } }) }, _sum: { pointsAwarded: true }, _count: { _all: true } }),
      this.prisma.arcadeMissionSubmission.aggregate({ where: { employeeId, status: ArcadeSubmissionStatus.APPROVED, ...(from && { reviewedAt: { gte: from } }) }, _sum: { pointsAwarded: true }, _count: { _all: true } }),
    ]);
    return { points: (plays._sum.pointsAwarded ?? 0) + (missions._sum.pointsAwarded ?? 0), playCount: plays._count._all, approvedMissionCount: missions._count._all };
  }

  async profile(user: AuthUser) {
    const employee = await this.currentEmployee(user);
    const [total, weekly, playDates] = await Promise.all([
      this.employeePoints(employee.id),
      this.employeePoints(employee.id, this.periodStart(ArcadeLeaderboardPeriod.WEEKLY)),
      this.prisma.arcadePlay.findMany({ where: { employeeId: employee.id }, select: { createdAt: true }, orderBy: { createdAt: 'desc' } }),
    ]);
    const streak = calculatePlayStreak(playDates.map((play) => play.createdAt));
    return { employee, totalPoints: total.points, weeklyPoints: weekly.points, playCount: total.playCount, approvedMissionCount: total.approvedMissionCount, streak, badges: deriveArcadeBadges({ ...total, totalPoints: total.points, streak }) };
  }

  async leaderboard(user: AuthUser, query: LeaderboardQueryDto) {
    const from = this.periodStart(query.period);
    const [plays, missions] = await Promise.all([
      this.prisma.arcadePlay.groupBy({ by: ['employeeId'], where: { companyId: user.companyId!, ...(from && { createdAt: { gte: from } }) }, _sum: { pointsAwarded: true } }),
      this.prisma.arcadeMissionSubmission.groupBy({ by: ['employeeId'], where: { companyId: user.companyId!, status: ArcadeSubmissionStatus.APPROVED, ...(from && { reviewedAt: { gte: from } }) }, _sum: { pointsAwarded: true } }),
    ]);
    const scores = new Map<string, number>();
    plays.forEach((row) => scores.set(row.employeeId, (scores.get(row.employeeId) ?? 0) + (row._sum.pointsAwarded ?? 0)));
    missions.forEach((row) => scores.set(row.employeeId, (scores.get(row.employeeId) ?? 0) + (row._sum.pointsAwarded ?? 0)));
    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, query.limit);
    const employees = await this.prisma.employee.findMany({ where: { companyId: user.companyId!, id: { in: ranked.map(([id]) => id) } }, select: employeeSelect });
    const byId = new Map(employees.map((employee) => [employee.id, employee]));
    return ranked.map(([employeeId, points], index) => ({ rank: index + 1, employee: byId.get(employeeId), points })).filter((item) => item.employee);
  }

  async home(user: AuthUser) {
    const [profile, challenges, missions, leaderboard, room] = await Promise.all([
      this.profile(user),
      this.challenges(user, Object.assign(new ArcadeContentQueryDto(), { pageSize: 5 })),
      this.missions(user, Object.assign(new MissionQueryDto(), { pageSize: 5 })),
      this.leaderboard(user, new LeaderboardQueryDto()),
      this.currentRoom(user),
    ]);
    return { profile, challenges: challenges.data, missions: missions.data, leaderboard, room };
  }

  async currentRoom(user: AuthUser) {
    const employee = await this.currentEmployee(user);
    return this.prisma.arcadeRoom.findFirst({
      where: { companyId: user.companyId!, status: { in: [ArcadeRoomStatus.WAITING, ArcadeRoomStatus.ACTIVE] }, expiresAt: { gt: new Date() }, members: { some: { employeeId: employee.id, leftAt: null } } },
      include: roomInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async matchmake(user: AuthUser, dto: MatchmakeRoomDto) {
    const employee = await this.currentEmployee(user);
    const existing = await this.currentRoom(user);
    if (existing) return existing;
    const now = new Date();
    const candidates = await this.prisma.arcadeRoom.findMany({ where: { companyId: user.companyId!, mode: dto.mode, status: ArcadeRoomStatus.WAITING, expiresAt: { gt: now } }, include: roomInclude, orderBy: { createdAt: 'asc' }, take: 10 });
    const room = candidates.find((candidate) => candidate.members.length < candidate.maxPlayers);
    if (!room) {
      return this.prisma.arcadeRoom.create({
        data: { companyId: user.companyId!, code: `ROOM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, mode: dto.mode, maxPlayers: dto.maxPlayers, expiresAt: new Date(now.getTime() + 10 * 60_000), members: { create: { employeeId: employee.id } } },
        include: roomInclude,
      });
    }
    await this.prisma.arcadeRoomMember.create({ data: { roomId: room.id, employeeId: employee.id } });
    const members = await this.prisma.arcadeRoomMember.count({ where: { roomId: room.id, leftAt: null } });
    if (members >= room.maxPlayers) await this.prisma.arcadeRoom.update({ where: { id: room.id }, data: { status: ArcadeRoomStatus.ACTIVE, startedAt: now } });
    return this.prisma.arcadeRoom.findUnique({ where: { id: room.id }, include: roomInclude });
  }

  private async activeMembership(user: AuthUser, roomId: string) {
    const employee = await this.currentEmployee(user);
    const member = await this.prisma.arcadeRoomMember.findFirst({ where: { roomId, employeeId: employee.id, leftAt: null, room: { companyId: user.companyId!, status: { in: [ArcadeRoomStatus.WAITING, ArcadeRoomStatus.ACTIVE] } } }, include: { room: true } });
    if (!member) throw new NotFoundException('Active room membership not found');
    return member;
  }

  async readyRoom(user: AuthUser, roomId: string) {
    const member = await this.activeMembership(user, roomId);
    await this.prisma.arcadeRoomMember.update({ where: { id: member.id }, data: { isReady: true } });
    const members = await this.prisma.arcadeRoomMember.findMany({ where: { roomId, leftAt: null } });
    if (member.room.status === ArcadeRoomStatus.WAITING && members.length >= 2 && members.every((item) => item.isReady)) {
      await this.prisma.arcadeRoom.update({ where: { id: roomId }, data: { status: ArcadeRoomStatus.ACTIVE, startedAt: new Date() } });
    }
    return this.prisma.arcadeRoom.findUnique({ where: { id: roomId }, include: roomInclude });
  }

  async leaveRoom(user: AuthUser, roomId: string) {
    const member = await this.activeMembership(user, roomId);
    await this.prisma.arcadeRoomMember.update({ where: { id: member.id }, data: { leftAt: new Date(), isReady: false } });
    const remaining = await this.prisma.arcadeRoomMember.count({ where: { roomId, leftAt: null } });
    if (remaining === 0 || (member.room.status === ArcadeRoomStatus.ACTIVE && remaining < 2)) {
      await this.prisma.arcadeRoom.update({ where: { id: roomId }, data: { status: remaining === 0 ? ArcadeRoomStatus.CANCELLED : ArcadeRoomStatus.FINISHED, finishedAt: new Date() } });
    }
    return { left: true };
  }

  async finishRoom(user: AuthUser, roomId: string) {
    const member = await this.activeMembership(user, roomId);
    if (member.room.status !== ArcadeRoomStatus.ACTIVE) throw new ConflictException('Only active rooms can be finished');
    await this.prisma.$transaction([
      this.prisma.arcadeRoom.update({ where: { id: roomId }, data: { status: ArcadeRoomStatus.FINISHED, finishedAt: new Date() } }),
      this.prisma.arcadeRoomMember.updateMany({ where: { roomId, leftAt: null }, data: { leftAt: new Date() } }),
    ]);
    return { finished: true };
  }
}
