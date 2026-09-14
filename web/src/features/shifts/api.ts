import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { Item } from '@/types';

export interface Shift extends Item {
  companyId: string;
  code: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  overtimeAllowed: boolean;
  overtimeThresholdMinutes: number;
  isActive: boolean;
}

export function useShifts(params?: { page?: number; pageSize?: number; search?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: ['shifts', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', String(params.page));
      if (params?.pageSize) searchParams.append('pageSize', String(params.pageSize));
      if (params?.search) searchParams.append('search', params.search);
      if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
      return api.get<Shift[]>(`/shifts?${searchParams.toString()}`);
    }
  });
}

export function useShiftOptions() {
  return useQuery({
    queryKey: ['shifts', 'options'],
    queryFn: () => api.get<Shift[]>('/shifts/options/list')
  });
}

export function useSaveShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Shift> & { id?: string }) => {
      if (data.id) {
        const { id, ...payload } = data;
        return api.patch(`/shifts/${id}`, payload);
      }
      return api.post('/shifts', data);
    },
    onSuccess: () => {
      toast.success('Shift saved');
      void queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/shifts/${id}`),
    onSuccess: () => {
      toast.success('Shift deleted');
      void queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}
