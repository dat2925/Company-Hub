// @ts-nocheck
/* eslint-disable */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import {
  Skill,
  EmployeeSkill,
  SkillRequirement,
  TalentMatch,
  TalentOpportunity,
  TalentApplication
} from '@/types';

// --- Skills Catalog ---
export function useSkills(params: { page: number; pageSize: number; search?: string; category?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['skills', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
      });
      if (params.search) searchParams.append('search', params.search);
      if (params.category) searchParams.append('category', params.category);
      if (params.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
      return api.get<Skill[]>(`/skills?${searchParams.toString()}`);
    }
  });
}

export function useSkillOptions() {
  return useQuery({
    queryKey: ['skills', 'options'],
    queryFn: () => api.get<unknown>('/talent/skills?isActive=true&pageSize=1000').then(res => res.data as Skill[])
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; name: string; category?: string; description?: string; isActive?: boolean }) => 
      api.post('/skills', data),
    onSuccess: () => {
      toast.success('Skill created');
      void queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Skill> & { id: string }) => {
      const { id, ...payload } = data;
      return api.patch(`/skills/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Skill updated');
      void queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/skills/${id}`),
    onSuccess: () => {
      toast.success('Skill deleted');
      void queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

// --- Employee Skills ---
export function useMySkills() {
  return useQuery({
    queryKey: ['employee-skills', 'me'],
    queryFn: () => api.get<unknown>('/talent/employees/me/skills').then(res => res.data as EmployeeSkill[])
  });
}

export function useEmployeeSkills(employeeId: string) {
  return useQuery({
    queryKey: ['employee-skills', employeeId],
    queryFn: () => api.get<EmployeeSkill[]>(`/talent/employees/${employeeId}/skills`),
    enabled: !!employeeId
  });
}

export function useUpdateEmployeeSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { employeeId: string; skillId: string; level: number; yearsExperience: number; source: string; evidence?: string | null; lastUsedAt?: string | null }) => {
      const { employeeId, skillId, ...payload } = data;
      return api.put(`/talent/employees/${employeeId}/skills/${skillId}`, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Employee skill updated');
      void queryClient.invalidateQueries({ queryKey: ['employee-skills', variables.employeeId] });
      void queryClient.invalidateQueries({ queryKey: ['employee-skills', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['talent-matches'] });
      void queryClient.invalidateQueries({ queryKey: ['bus-factor'] });
      void queryClient.invalidateQueries({ queryKey: ['growth-plan'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteEmployeeSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { employeeId: string; skillId: string }) => api.delete(`/talent/employees/${data.employeeId}/skills/${data.skillId}`),
    onSuccess: (_, variables) => {
      toast.success('Employee skill removed');
      void queryClient.invalidateQueries({ queryKey: ['employee-skills', variables.employeeId] });
      void queryClient.invalidateQueries({ queryKey: ['employee-skills', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['talent-matches'] });
      void queryClient.invalidateQueries({ queryKey: ['bus-factor'] });
      void queryClient.invalidateQueries({ queryKey: ['growth-plan'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

// --- Project Requirements & Matching ---
export function useProjectRequirements(projectId: string) {
  return useQuery({
    queryKey: ['project-requirements', projectId],
    queryFn: () => api.get<unknown>(`/talent/projects/${projectId}/requirements`).then(res => res.data as SkillRequirement[]),
    enabled: !!projectId
  });
}

export function useUpdateProjectRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: string; skillId: string; minimumLevel?: number; weight?: number; isRequired?: boolean }) => {
      const { projectId, skillId, ...payload } = data;
      return api.put(`/talent/projects/${projectId}/requirements/${skillId}`, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Project requirement updated');
      void queryClient.invalidateQueries({ queryKey: ['project-requirements', variables.projectId] });
      void queryClient.invalidateQueries({ queryKey: ['talent-matches', variables.projectId] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteProjectRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { projectId: string; skillId: string }) => api.delete(`/talent/projects/${data.projectId}/requirements/${data.skillId}`),
    onSuccess: (_, variables) => {
      toast.success('Project requirement removed');
      void queryClient.invalidateQueries({ queryKey: ['project-requirements', variables.projectId] });
      void queryClient.invalidateQueries({ queryKey: ['talent-matches', variables.projectId] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useProjectMatches(projectId: string, limit: number = 10) {
  return useQuery({
    queryKey: ['talent-matches', projectId],
    queryFn: () => api.get<unknown>(`/talent/projects/${projectId}/matches?limit=${limit}`).then(res => res.data as { project: unknown; requirements: SkillRequirement[]; candidates: TalentMatch[] }),
    enabled: !!projectId
  });
}

export function useProjectEvidenceSuggestions(projectId: string) {
  return useQuery({
    queryKey: ['project-evidence-suggestions', projectId],
    queryFn: () => api.get<unknown>(`/talent/projects/${projectId}/evidence-suggestions`).then(res => res.data as { project: unknown; suggestions: unknown[] }),
    enabled: !!projectId
  });
}

// --- Bus Factor & Growth Plan ---
export function useBusFactor(params: { maxHolders: number; minimumLevel: number }) {
  return useQuery({
    queryKey: ['bus-factor', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        maxHolders: String(params.maxHolders),
        minimumLevel: String(params.minimumLevel)
      });
      return api.get<unknown>(`/talent/bus-factor?${searchParams.toString()}`).then(res => res.data as { criticalSkillCount: number; criticalSkills: unknown[] });
    }
  });
}

export function useEmployeeImpact(employeeId: string) {
  return useQuery({
    queryKey: ['employee-impact', employeeId],
    queryFn: () => api.get<unknown>(`/talent/employees/${employeeId}/impact`).then(res => res.data as any),
    enabled: !!employeeId
  });
}

export function useGrowthPlan(employeeId: string) {
  return useQuery({
    queryKey: ['growth-plan', employeeId],
    queryFn: () => api.get<unknown>(`/talent/employees/${employeeId}/growth-plan`).then(res => res.data as any),
    enabled: !!employeeId
  });
}

export function useMyGrowthPlan() {
  return useQuery({
    queryKey: ['growth-plan', 'me'],
    queryFn: () => api.get<unknown>(`/talent/employees/me/growth-plan`).then(res => res.data as any)
  });
}

// --- Opportunities ---
export function useTalentOpportunities(params: { page: number; pageSize: number; search?: string; type?: string; status?: string }) {
  return useQuery({
    queryKey: ['talent-opportunities', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
      });
      if (params.search) searchParams.append('search', params.search);
      if (params.type) searchParams.append('type', params.type);
      if (params.status) searchParams.append('status', params.status);
      return api.get<TalentOpportunity[]>(`/talent-opportunities?${searchParams.toString()}`);
    }
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['talent-opportunities', id],
    queryFn: () => api.get<TalentOpportunity>(`/talent-opportunities/${id}`),
    enabled: !!id
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => api.post('/talent-opportunities', data),
    onSuccess: () => {
      toast.success('Opportunity created');
      void queryClient.invalidateQueries({ queryKey: ['talent-opportunities'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown> & { id: string }) => {
      const { id, ...payload } = data;
      return api.patch(`/talent-opportunities/${id}`, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Opportunity updated');
      void queryClient.invalidateQueries({ queryKey: ['talent-opportunities'] });
      void queryClient.invalidateQueries({ queryKey: ['talent-opportunities', variables.id] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useUpdateOpportunityRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { opportunityId: string; skillId: string; minimumLevel?: number; weight?: number; isRequired?: boolean }) => {
      const { opportunityId, skillId, ...payload } = data;
      return api.put(`/talent-opportunities/${opportunityId}/requirements/${skillId}`, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Opportunity requirement updated');
      void queryClient.invalidateQueries({ queryKey: ['talent-opportunities', variables.opportunityId] });
      void queryClient.invalidateQueries({ queryKey: ['talent-opportunities-matches', variables.opportunityId] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteOpportunityRequirement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { opportunityId: string; skillId: string }) => api.delete(`/talent-opportunities/${data.opportunityId}/requirements/${data.skillId}`),
    onSuccess: (_, variables) => {
      toast.success('Opportunity requirement removed');
      void queryClient.invalidateQueries({ queryKey: ['talent-opportunities', variables.opportunityId] });
      void queryClient.invalidateQueries({ queryKey: ['talent-opportunities-matches', variables.opportunityId] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useOpportunityMatches(opportunityId: string, limit: number = 20) {
  return useQuery({
    queryKey: ['talent-opportunities-matches', opportunityId],
    queryFn: () => api.get<unknown>(`/talent-opportunities/${opportunityId}/matches?limit=${limit}`).then(res => res.data as any),
    enabled: !!opportunityId
  });
}

export function useMyOpportunityMatch(opportunityId: string) {
  return useQuery({
    queryKey: ['talent-opportunities-my-match', opportunityId],
    queryFn: () => api.get<{ opportunity: TalentOpportunity; match: TalentMatch }>(`/talent-opportunities/${opportunityId}/my-match`),
    enabled: !!opportunityId
  });
}

export function useApplyOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { opportunityId: string; message?: string }) => {
      const { opportunityId, ...payload } = data;
      return api.post(`/talent-opportunities/${opportunityId}/apply`, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Applied successfully');
      void queryClient.invalidateQueries({ queryKey: ['talent-applications'] });
      void queryClient.invalidateQueries({ queryKey: ['talent-opportunities', variables.opportunityId] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: ['talent-applications', 'me'],
    queryFn: () => api.get<TalentApplication[]>('/talent-opportunities/my-applications')
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => api.patch(`/talent-opportunities/my-applications/${applicationId}/withdraw`, {}),
    onSuccess: () => {
      toast.success('Application withdrawn');
      void queryClient.invalidateQueries({ queryKey: ['talent-applications'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useOpportunityApplications(opportunityId: string) {
  return useQuery({
    queryKey: ['talent-applications', opportunityId],
    queryFn: () => api.get<unknown>(`/talent-opportunities/${opportunityId}/applications`).then(res => res.data as TalentApplication[]),
    enabled: !!opportunityId
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { opportunityId: string; applicationId: string; status: string }) => api.patch(`/talent-opportunities/${data.opportunityId}/applications/${data.applicationId}`, { status: data.status }),
    onSuccess: (_, variables) => {
      toast.success('Application status updated');
      void queryClient.invalidateQueries({ queryKey: ['talent-applications', variables.opportunityId] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}
