export const arcadeQueryKeys = {
  all: ['arcade'] as const,
  home: () => [...arcadeQueryKeys.all, 'home'] as const,
  profile: () => [...arcadeQueryKeys.all, 'profile'] as const,
  challenges: (params: Record<string, unknown>) => [...arcadeQueryKeys.all, 'challenges', params] as const,
  challengeResults: (id: string) => [...arcadeQueryKeys.all, 'challenges', id, 'results'] as const,
  missions: (params: Record<string, unknown>) => [...arcadeQueryKeys.all, 'missions', params] as const,
  missionSubmissions: (params: Record<string, unknown>) => [...arcadeQueryKeys.all, 'mission-submissions', params] as const,
  leaderboard: (period: string) => [...arcadeQueryKeys.all, 'leaderboard', period] as const,
  roomCurrent: () => [...arcadeQueryKeys.all, 'rooms', 'current'] as const,
};
