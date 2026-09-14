export type ImpactSnapshotInput = {
  entries: Array<{ type: string; isHighlighted: boolean }>;
  completedIssues: Array<{ priority: string; projectId: string }>;
  recognitionCount: number;
  activeGoalCount: number;
  completedGoalCount: number;
  workedMinutes: number;
  overtimeMinutes: number;
};

export function summarizeImpact(input: ImpactSnapshotInput) {
  const entriesByType = input.entries.reduce<Record<string, number>>((result, entry) => {
    result[entry.type] = (result[entry.type] ?? 0) + 1;
    return result;
  }, {});
  return {
    entryCount: input.entries.length,
    highlightedCount: input.entries.filter((entry) => entry.isHighlighted).length,
    entriesByType,
    completedIssueCount: input.completedIssues.length,
    highPriorityIssueCount: input.completedIssues.filter((issue) => issue.priority === 'HIGH' || issue.priority === 'URGENT').length,
    contributedProjectCount: new Set(input.completedIssues.map((issue) => issue.projectId)).size,
    recognitionCount: input.recognitionCount,
    activeGoalCount: input.activeGoalCount,
    completedGoalCount: input.completedGoalCount,
    workedMinutes: input.workedMinutes,
    overtimeMinutes: input.overtimeMinutes,
  };
}
