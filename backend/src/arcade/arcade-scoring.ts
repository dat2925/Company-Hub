import { ArcadeChallengeType } from '@prisma/client';

export function scoreChallenge(type: ArcadeChallengeType, answer: string, correctAnswer: string | null, points: number) {
  if (type === ArcadeChallengeType.TRIVIA || type === ArcadeChallengeType.GUESS_COLLEAGUE) {
    const isCorrect = answer.trim().toLocaleLowerCase() === (correctAnswer ?? '').trim().toLocaleLowerCase();
    return { isCorrect, pointsAwarded: isCorrect ? points : 0 };
  }
  return { isCorrect: null, pointsAwarded: Math.max(1, Math.floor(points / 2)) };
}

const dayKey = (date: Date) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export function calculatePlayStreak(playDates: Date[], now = new Date()) {
  const days = [...new Set(playDates.map(dayKey))].sort((a, b) => b - a);
  if (!days.length) return 0;
  const today = dayKey(now);
  if (today - days[0] > 86_400_000) return 0;
  let streak = 1;
  for (let index = 1; index < days.length; index += 1) {
    if (days[index - 1] - days[index] !== 86_400_000) break;
    streak += 1;
  }
  return streak;
}

export function deriveArcadeBadges(input: { playCount: number; totalPoints: number; streak: number; approvedMissionCount: number }) {
  const badges: string[] = [];
  if (input.playCount >= 1) badges.push('FIRST_PLAY');
  if (input.playCount >= 5) badges.push('QUIZ_ROOKIE');
  if (input.totalPoints >= 100) badges.push('ARCADE_STAR');
  if (input.streak >= 3) badges.push('STREAK_3');
  if (input.approvedMissionCount >= 3) badges.push('MISSION_HERO');
  return badges;
}
