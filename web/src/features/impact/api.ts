import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import {
  DashboardSummary,
  ImpactSuggestion,
  ImpactEntry,
  FeedItem,
  Recognition,
  EmployeeGoal,
  ImpactReport
} from './types';
import {
  ImpactEntryFormValues,
  RecognitionFormValues,
  EmployeeGoalFormValues,
  GenerateReportFormValues
} from './schemas';

// --- Dashboard & Suggestions ---
export function useImpactDashboard(params?: { from?: string; to?: string; employeeId?: string }) {
  return useQuery({
    queryKey: ['impact-dashboard', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.from) searchParams.append('from', params.from);
      if (params?.to) searchParams.append('to', params.to);
      if (params?.employeeId) searchParams.append('employeeId', params.employeeId);
      return api.get<DashboardSummary>(`/impact/dashboard?${searchParams.toString()}`).then(res => res.data);
    }
  });
}

export function useImpactSuggestions() {
  return useQuery({
    queryKey: ['impact-suggestions'],
    queryFn: () => api.get<ImpactSuggestion[]>('/impact/suggestions').then(res => res.data)
  });
}

// --- Impact Entries ---
export function useImpactEntries(params: { page: number; pageSize: number; search?: string; from?: string; to?: string; employeeId?: string; type?: string; visibility?: string }) {
  return useQuery({
    queryKey: ['impact-entries', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
      });
      if (params.search) searchParams.append('search', params.search);
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.employeeId) searchParams.append('employeeId', params.employeeId);
      if (params.type) searchParams.append('type', params.type);
      if (params.visibility) searchParams.append('visibility', params.visibility);
      return api.get<ImpactEntry[]>(`/impact/entries?${searchParams.toString()}`).then(res => res.data);
    }
  });
}

export function useCreateImpactEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImpactEntryFormValues) => api.post('/impact/entries', data),
    onSuccess: () => {
      toast.success('Impact entry created');
      void queryClient.invalidateQueries({ queryKey: ['impact-entries'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-suggestions'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-feed'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useUpdateImpactEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ImpactEntryFormValues> & { id: string }) => {
      const { id, ...payload } = data;
      return api.patch(`/impact/entries/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Impact entry updated');
      void queryClient.invalidateQueries({ queryKey: ['impact-entries'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-feed'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteImpactEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/impact/entries/${id}`),
    onSuccess: () => {
      toast.success('Impact entry deleted');
      void queryClient.invalidateQueries({ queryKey: ['impact-entries'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-feed'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

// --- Feed ---
export function useImpactFeed(pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['impact-feed', pageSize],
    queryFn: ({ pageParam = 1 }) => {
      return api.get<FeedItem[]>(`/impact/feed?page=${pageParam}&pageSize=${pageSize}`).then(res => res.data);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === pageSize ? allPages.length + 1 : undefined;
    }
  });
}

// --- Recognitions ---
export function useRecognitions(params: { page: number; pageSize: number; employeeId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['impact-recognitions', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
      });
      if (params.employeeId) searchParams.append('employeeId', params.employeeId);
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      return api.get<Recognition[]>(`/impact/recognitions?${searchParams.toString()}`).then(res => res.data);
    }
  });
}

export function useCreateRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecognitionFormValues) => api.post('/impact/recognitions', data),
    onSuccess: () => {
      toast.success('Recognition sent');
      void queryClient.invalidateQueries({ queryKey: ['impact-recognitions'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-feed'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteRecognition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/impact/recognitions/${id}`),
    onSuccess: () => {
      toast.success('Recognition deleted');
      void queryClient.invalidateQueries({ queryKey: ['impact-recognitions'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-feed'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

// --- Goals ---
export function useEmployeeGoals(params: { page: number; pageSize: number; search?: string; employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: ['impact-goals', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
      });
      if (params.search) searchParams.append('search', params.search);
      if (params.employeeId) searchParams.append('employeeId', params.employeeId);
      if (params.status) searchParams.append('status', params.status);
      return api.get<EmployeeGoal[]>(`/impact/goals?${searchParams.toString()}`).then(res => res.data);
    }
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeGoalFormValues) => api.post('/impact/goals', data),
    onSuccess: () => {
      toast.success('Goal created');
      void queryClient.invalidateQueries({ queryKey: ['impact-goals'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-dashboard'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmployeeGoalFormValues> & { id: string }) => {
      const { id, ...payload } = data;
      return api.patch(`/impact/goals/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Goal updated');
      void queryClient.invalidateQueries({ queryKey: ['impact-goals'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-dashboard'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/impact/goals/${id}`),
    onSuccess: () => {
      toast.success('Goal deleted');
      void queryClient.invalidateQueries({ queryKey: ['impact-goals'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-dashboard'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

// --- Reports ---
export function useImpactReports(params: { page: number; pageSize: number; employeeId?: string; status?: string }) {
  return useQuery({
    queryKey: ['impact-reports', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
      });
      if (params.employeeId) searchParams.append('employeeId', params.employeeId);
      if (params.status) searchParams.append('status', params.status);
      return api.get<ImpactReport[]>(`/impact/reports?${searchParams.toString()}`).then(res => res.data);
    }
  });
}

export function useImpactReport(id: string) {
  return useQuery({
    queryKey: ['impact-reports', id],
    queryFn: () => api.get<ImpactReport>(`/impact/reports/${id}`).then(res => res.data),
    enabled: !!id
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateReportFormValues) => api.post('/impact/reports/generate', data),
    onSuccess: () => {
      toast.success('Report generated');
      void queryClient.invalidateQueries({ queryKey: ['impact-reports'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useUpdateReportDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; selfReflection?: string }) => {
      const { id, ...payload } = data;
      return api.patch(`/impact/reports/${id}`, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Draft saved');
      void queryClient.invalidateQueries({ queryKey: ['impact-reports'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-reports', variables.id] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/impact/reports/${id}/submit`, {}),
    onSuccess: (_, variables) => {
      toast.success('Report submitted for review');
      void queryClient.invalidateQueries({ queryKey: ['impact-reports'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-reports', variables] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useReviewReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; managerComment: string }) => {
      const { id, ...payload } = data;
      return api.patch(`/impact/reports/${id}/review`, payload);
    },
    onSuccess: (_, variables) => {
      toast.success('Report reviewed');
      void queryClient.invalidateQueries({ queryKey: ['impact-reports'] });
      void queryClient.invalidateQueries({ queryKey: ['impact-reports', variables.id] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}
