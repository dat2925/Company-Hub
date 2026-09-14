import { summarizeImpact } from '../src/impact/impact-summary';

describe('summarizeImpact', () => {
  it('summarizes achievements, delivery, goals, recognition, and work time', () => {
    expect(
      summarizeImpact({
        entries: [
          { type: 'DELIVERY', isHighlighted: true },
          { type: 'DELIVERY', isHighlighted: false },
          { type: 'TEAM_SUPPORT', isHighlighted: true },
        ],
        completedIssues: [
          { priority: 'URGENT', projectId: 'project-a' },
          { priority: 'HIGH', projectId: 'project-a' },
          { priority: 'MEDIUM', projectId: 'project-b' },
        ],
        recognitionCount: 4,
        activeGoalCount: 2,
        completedGoalCount: 1,
        workedMinutes: 9_600,
        overtimeMinutes: 420,
      }),
    ).toEqual({
      entryCount: 3,
      highlightedCount: 2,
      entriesByType: { DELIVERY: 2, TEAM_SUPPORT: 1 },
      completedIssueCount: 3,
      highPriorityIssueCount: 2,
      contributedProjectCount: 2,
      recognitionCount: 4,
      activeGoalCount: 2,
      completedGoalCount: 1,
      workedMinutes: 9_600,
      overtimeMinutes: 420,
    });
  });

  it('returns zero values for an empty period', () => {
    expect(
      summarizeImpact({
        entries: [],
        completedIssues: [],
        recognitionCount: 0,
        activeGoalCount: 0,
        completedGoalCount: 0,
        workedMinutes: 0,
        overtimeMinutes: 0,
      }),
    ).toMatchObject({
      entryCount: 0,
      highlightedCount: 0,
      entriesByType: {},
      completedIssueCount: 0,
      highPriorityIssueCount: 0,
      contributedProjectCount: 0,
    });
  });
});
