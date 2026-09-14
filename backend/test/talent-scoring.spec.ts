import { calculateAvailability, scoreTalentMatch } from '../src/talent/talent-scoring';

describe('Talent intelligence scoring', () => {
  const requirements = [
    { skillId: 'typescript', minimumLevel: 4, weight: 3, isRequired: true, skill: { code: 'TS', name: 'TypeScript' } },
    { skillId: 'leadership', minimumLevel: 3, weight: 1, isRequired: false, skill: { code: 'LEAD', name: 'Leadership' } },
  ];

  it('weights skill fit and availability without hiding missing required skills', () => {
    const result = scoreTalentMatch(requirements, [{ skillId: 'typescript', level: 3 }, { skillId: 'leadership', level: 3 }], 80);
    expect(result.skillFitScore).toBe(81);
    expect(result.matchScore).toBe(81);
    expect(result.meetsAllRequiredSkills).toBe(false);
    expect(result.missingRequiredSkills).toEqual([expect.objectContaining({ skillId: 'typescript', currentLevel: 3, requiredLevel: 4 })]);
  });

  it('penalizes open work and recent overtime while keeping score in range', () => {
    expect(calculateAvailability(3, 600)).toBe(50);
    expect(calculateAvailability(20, 5000)).toBe(0);
  });
});
