import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { Item } from '@/types';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'PAID_LEAVE' | 'UNPAID_LEAVE';

export interface Attendance extends Item {
  companyId: string;
  employeeId: string;
  workDate: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workedMinutes: number;
  overtimeMinutes: number;
  note?: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
}

export interface AttendanceSummary {
  records: Attendance[];
  workedMinutes: number;
  overtimeMinutes: number;
  byStatus: Partial<Record<AttendanceStatus, number>>;
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { note?: string }) => api.post('/attendance/check-in', data),
    onSuccess: () => {
      toast.success('Check-in successful');
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { note?: string }) => api.post('/attendance/check-out', data),
    onSuccess: () => {
      toast.success('Check-out successful');
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useAttendanceSummary(month: string, employeeId?: string) {
  return useQuery({
    queryKey: ['attendance', 'summary', month, employeeId],
    queryFn: () => {
      const params = new URLSearchParams({ month });
      if (employeeId) params.append('employeeId', employeeId);
      return api.get<AttendanceSummary>(`/attendance/summary?${params.toString()}`);
    }
  });
}

export function useAttendanceList(params: { page: number; pageSize: number; month: string; employeeId?: string }) {
  return useQuery({
    queryKey: ['attendance', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
        month: params.month
      });
      if (params.employeeId) searchParams.append('employeeId', params.employeeId);
      return api.get<Attendance[]>(`/attendance?${searchParams.toString()}`);
    }
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Attendance> & { id?: string }) => {
      if (data.id) {
        const { id, ...payload } = data;
        return api.patch(`/attendance/${id}`, payload);
      }
      return api.post('/attendance', data);
    },
    onSuccess: () => {
      toast.success('Attendance saved');
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/attendance/${id}`),
    onSuccess: () => {
      toast.success('Attendance deleted');
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}
