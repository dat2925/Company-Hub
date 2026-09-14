import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { Item } from '@/types';

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT' | 'PAID_LEAVE' | 'UNPAID_LEAVE';

export interface Attendance extends Item {
  companyId: string;
  employeeId: string;
  shiftAssignmentId: string | null;
  workDate: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  workedMinutes: number;
  regularMinutes: number;
  scheduledMinutes: number;
  overtimeMinutes: number;
  earlyArrivalMinutes: number;
  lateArrivalMinutes: number;
  earlyLeaveMinutes: number;
  lateLeaveMinutes: number;
  hasOvertime: boolean;
  note: string | null;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
  shiftAssignment?: {
    id: string;
    shift: {
      id: string;
      code: string;
      name: string;
      startTime: string;
      endTime: string;
      breakMinutes: number;
      lateGraceMinutes: number;
      earlyLeaveGraceMinutes: number;
      overtimeAllowed: boolean;
      overtimeThresholdMinutes: number;
    }
  } | null;
}

export interface AttendanceSummary {
  records: number;
  overtimeRecords: number;
  workedMinutes: number;
  regularMinutes: number;
  overtimeMinutes: number;
  earlyArrivalMinutes: number;
  lateArrivalMinutes: number;
  earlyLeaveMinutes: number;
  lateLeaveMinutes: number;
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

export function useAttendanceSummary(params: { month?: string; from?: string; to?: string; employeeId?: string }) {
  return useQuery({
    queryKey: ['attendance', 'summary', params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.month) searchParams.append('month', params.month);
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
      if (params.employeeId) searchParams.append('employeeId', params.employeeId);
      return api.get<AttendanceSummary>(`/attendance/summary?${searchParams.toString()}`);
    }
  });
}

export function useAttendanceList(params: { page: number; pageSize: number; month?: string; from?: string; to?: string; employeeId?: string }) {
  return useQuery({
    queryKey: ['attendance', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize)
      });
      if (params.month) searchParams.append('month', params.month);
      if (params.from) searchParams.append('from', params.from);
      if (params.to) searchParams.append('to', params.to);
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
