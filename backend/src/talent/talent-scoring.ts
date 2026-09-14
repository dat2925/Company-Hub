export type RequirementInput = { skillId: string; minimumLevel: number; weight: number; isRequired: boolean; skill?: { code: string; name: string } };
export type EmployeeSkillInput = { skillId: string; level: number };

export function calculateAvailability(openIssueCount: number, overtimeMinutes: number): number {
  return Math.max(0, Math.round(100 - openIssueCount * 10 - Math.min(40, (overtimeMinutes / 60) * 2)));
}

export function scoreTalentMatch(requirements: RequirementInput[], employeeSkills: EmployeeSkillInput[], availabilityScore: number) {
  const levels = new Map(employeeSkills.map((item) => [item.skillId, item.level]));
  const totalWeight = requirements.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = requirements.reduce((sum, item) => sum + Math.min((levels.get(item.skillId) ?? 0) / item.minimumLevel, 1) * item.weight, 0);
  const skillFitScore = totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const missingRequiredSkills = requirements.filter((item) => item.isRequired && (levels.get(item.skillId) ?? 0) < item.minimumLevel).map((item) => ({ skillId: item.skillId, code: item.skill?.code, name: item.skill?.name, currentLevel: levels.get(item.skillId) ?? 0, requiredLevel: item.minimumLevel }));
  const matchScore = Math.round(skillFitScore * 0.8 + availabilityScore * 0.2);
  return { matchScore, skillFitScore, availabilityScore, missingRequiredSkills, meetsAllRequiredSkills: missingRequiredSkills.length === 0 };
}
