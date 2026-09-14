import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { arcadeQueryKeys } from './query-keys';
import { 
  ArcadeHomeResponse, 
  ArcadeProfile, 
  EmployeeChallenge, 
  ChallengeResult, 
  EmployeeMission, 
  MissionSubmission, 
  LeaderboardItem, 
  ArcadeRoom, 
  ArcadeLeaderboardPeriod 
} from './types';
import { 
  CreateChallengeInput, 
  CreateMissionInput, 
  SubmitMissionInput, 
  ReviewMissionInput 
} from './schemas';
import { toast } from 'sonner';

// --- EMPLOYEE APIs ---

export function useArcadeHome() {
  return useQuery({
    queryKey: arcadeQueryKeys.home(),
    queryFn: () => api.get<ArcadeHomeResponse>('/arcade/home'),
  });
}

export function useArcadeProfile() {
  return useQuery({
    queryKey: arcadeQueryKeys.profile(),
    queryFn: () => api.get<ArcadeProfile>('/arcade/profile'),
  });
}

export function usePlayChallenge(challengeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { answer: string; durationMs?: number }) => 
      api.post(`/arcade/challenges/${challengeId}/play`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.home() });
      queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.challenges({}) });
    }
  });
}

export function useSubmitMission(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitMissionInput) => 
      api.post(`/arcade/missions/${missionId}/submit`, data),
    onSuccess: () => {
      toast.success('Mission submitted!');
      queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.home() });
      queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.missions({}) });
    }
  });
}

export function useMatchmakeRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { mode: 'QUICK_QUIZ' | 'ICEBREAKER'; maxPlayers?: number }) => 
      api.post<ArcadeRoom>('/arcade/rooms/matchmake', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.roomCurrent() });
    }
  });
}

export function useCurrentRoom() {
  return useQuery({
    queryKey: arcadeQueryKeys.roomCurrent(),
    queryFn: () => api.get<ArcadeRoom>('/arcade/rooms/current'),
    retry: false
  });
}

export function useRoomAction(roomId: string, action: 'ready' | 'leave' | 'finish') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/arcade/rooms/${roomId}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.roomCurrent() });
      if (action === 'leave' || action === 'finish') {
        queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.home() });
      }
    }
  });
}

// --- ADMIN & SHARED APIs ---

export function useChallenges(params: { page: number; pageSize: number; search?: string; status?: string; type?: string }) {
  return useQuery({
    queryKey: arcadeQueryKeys.challenges(params),
    queryFn: () => {
      const searchParams = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as string[][]);
      return api.get<EmployeeChallenge[]>(`/arcade/challenges?${searchParams.toString()}`);
    }
  });
}

export function useChallengeResults(challengeId: string) {
  return useQuery({
    queryKey: arcadeQueryKeys.challengeResults(challengeId),
    queryFn: () => api.get<ChallengeResult>(`/arcade/challenges/${challengeId}/results`),
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChallengeInput) => api.post('/arcade/challenges', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.all })
  });
}

export function useUpdateChallenge(challengeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateChallengeInput>) => api.patch(`/arcade/challenges/${challengeId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.all })
  });
}

export function useChallengeAction(challengeId: string, action: 'publish' | 'close') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/arcade/challenges/${challengeId}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.all })
  });
}

export function useDeleteChallenge(challengeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/arcade/challenges/${challengeId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.all })
  });
}

export function useMissions(params: { page: number; pageSize: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: arcadeQueryKeys.missions(params),
    queryFn: () => {
      const searchParams = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as string[][]);
      return api.get<EmployeeMission[]>(`/arcade/missions?${searchParams.toString()}`);
    }
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMissionInput) => api.post('/arcade/missions', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.all })
  });
}

export function useUpdateMission(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateMissionInput>) => api.patch(`/arcade/missions/${missionId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.all })
  });
}

export function useMissionAction(missionId: string, action: 'publish' | 'close') {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/arcade/missions/${missionId}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.all })
  });
}

export function useDeleteMission(missionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/arcade/missions/${missionId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.all })
  });
}

export function useMissionSubmissions(params: { page: number; pageSize: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: arcadeQueryKeys.missionSubmissions(params),
    queryFn: () => {
      const searchParams = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as string[][]);
      return api.get<MissionSubmission[]>(`/arcade/mission-submissions?${searchParams.toString()}`);
    }
  });
}

export function useReviewSubmission(submissionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewMissionInput) => api.patch(`/arcade/mission-submissions/${submissionId}/review`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arcadeQueryKeys.missionSubmissions({}) });
      toast.success('Submission reviewed!');
    }
  });
}

export function useLeaderboard(period: ArcadeLeaderboardPeriod) {
  return useQuery({
    queryKey: arcadeQueryKeys.leaderboard(period),
    queryFn: () => api.get<LeaderboardItem[]>(`/arcade/leaderboard?period=${period}&limit=20`),
  });
}
