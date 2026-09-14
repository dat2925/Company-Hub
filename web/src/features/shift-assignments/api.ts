import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { Item } from '@/types';
import { Shift } from '@/features/shifts/api';

export interface ShiftAssignment extends Item {
  companyId: string;
  employeeId: string;
  shiftId: string;
  workDate: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  breakMinutes: number;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  overtimeAllowed: boolean;
  overtimeThresholdMinutes: number;
  note: string | null;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  shift?: Shift;
}

export function useShiftAssignments(params?: { page?: number; pageSize?: number; from?: string; to?: string; employeeId?: string; shiftId?: string }) {
  return useQuery({
    queryKey: ['shift-assignments', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', String(params.page));
      if (params?.pageSize) searchParams.append('pageSize', String(params.pageSize));
      if (params?.from) searchParams.append('from', params.from);
      if (params?.to) searchParams.append('to', params.to);
      if (params?.employeeId) searchParams.append('employeeId', params.employeeId);
      if (params?.shiftId) searchParams.append('shiftId', params.shiftId);
      return api.get<ShiftAssignment[]>(`/shift-assignments?${searchParams.toString()}`);
    }
  });
}

export function useSaveAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ShiftAssignment> & { id?: string }) => {
      if (data.id) {
        const { id, ...payload } = data;
        return api.patch(`/shift-assignments/${id}`, payload);
      }
      return api.post('/shift-assignments', data);
    },
    onSuccess: () => {
      toast.success('Assignment saved');
      void queryClient.invalidateQueries({ queryKey: ['shift-assignments'] });
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useBulkSaveAssignments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { employeeIds: string[]; shiftId: string; startDate: string; endDate: string; daysOfWeek?: number[]; note?: string }) => {
      return api.post<{ created: number; skipped: number }>('/shift-assignments/bulk', data);
    },
    onSuccess: (res) => {
      toast.success(`Created ${res.data.created} assignments. Skipped ${res.data.skipped}.`);
      void queryClient.invalidateQueries({ queryKey: ['shift-assignments'] });
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/shift-assignments/${id}`),
    onSuccess: () => {
      toast.success('Assignment deleted');
      void queryClient.invalidateQueries({ queryKey: ['shift-assignments'] });
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}
