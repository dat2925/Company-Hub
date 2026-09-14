import { ArcadeChallengeType } from '@prisma/client';
import { calculatePlayStreak, deriveArcadeBadges, scoreChallenge } from '../src/arcade/arcade-scoring';

describe('arcade scoring', () => {
  it('awards full points only for a correct trivia answer', () => {
    expect(scoreChallenge(ArcadeChallengeType.TRIVIA, ' Hà Nội ', 'hà nội', 20)).toEqual({ isCorrect: true, pointsAwarded: 20 });
    expect(scoreChallenge(ArcadeChallengeType.TRIVIA, 'Huế', 'Hà Nội', 20)).toEqual({ isCorrect: false, pointsAwarded: 0 });
  });

  it('awards participation points for polls and creative challenges', () => {
    expect(scoreChallenge(ArcadeChallengeType.POLL, 'A', null, 15)).toEqual({ isCorrect: null, pointsAwarded: 7 });
    expect(scoreChallenge(ArcadeChallengeType.CAPTION, 'Hello', null, 1)).toEqual({ isCorrect: null, pointsAwarded: 1 });
  });

  it('calculates a streak that may continue from yesterday', () => {
    const now = new Date('2026-09-13T12:00:00.000Z');
    const dates = ['2026-09-12', '2026-09-11', '2026-09-10', '2026-09-08'].map((date) => new Date(`${date}T08:00:00.000Z`));
    expect(calculatePlayStreak(dates, now)).toBe(3);
  });

  it('derives badges from activity without affecting work performance', () => {
    expect(deriveArcadeBadges({ playCount: 6, totalPoints: 120, streak: 3, approvedMissionCount: 4 })).toEqual([
      'FIRST_PLAY',
      'QUIZ_ROOKIE',
      'ARCADE_STAR',
      'STREAK_3',
      'MISSION_HERO',
    ]);
  });
});
