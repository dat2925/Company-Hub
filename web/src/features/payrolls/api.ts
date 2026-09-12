import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api/client';
import { Item } from '@/types';

export interface SalaryProfile extends Item {
  companyId: string;
  employeeId: string;
  baseSalary: string | number;
  allowance: string | number;
  overtimeHourlyRate: string | number;
  standardWorkingDays: number;
  standardMinutesPerDay: number;
  currency: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
}

export interface Payroll extends Item {
  companyId: string;
  employeeId: string;
  year: number;
  month: number;
  baseSalary: string | number;
  allowance: string | number;
  overtimeHourlyRate: string | number;
  standardWorkingDays: number;
  standardMinutesPerDay: number;
  regularMinutes: number;
  paidLeaveMinutes: number;
  overtimeMinutes: number;
  attendancePay: string | number;
  overtimePay: string | number;
  deductions: string | number;
  netSalary: string | number;
  currency: string;
  status: 'DRAFT' | 'FINALIZED';
  calculatedAt: string;
  finalizedAt?: string;
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
  };
}

export function useMySalaryProfile() {
  return useQuery({
    queryKey: ['salary-profiles', 'me'],
    queryFn: () => api.get<SalaryProfile>('/salary-profiles/me'),
    retry: false
  });
}

export function useSalaryProfiles(params: { page: number; pageSize: number; search: string }) {
  return useQuery({
    queryKey: ['salary-profiles', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
        search: params.search
      });
      return api.get<SalaryProfile[]>(`/salary-profiles?${searchParams.toString()}`);
    }
  });
}

export function useUpdateSalaryProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SalaryProfile> & { employeeId: string }) => {
      const { employeeId, ...payload } = data;
      return api.put(`/salary-profiles/${employeeId}`, payload);
    },
    onSuccess: () => {
      toast.success('Salary profile updated');
      void queryClient.invalidateQueries({ queryKey: ['salary-profiles'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function usePayrolls(params: { page: number; pageSize: number; month: string; employeeId?: string; search?: string }) {
  return useQuery({
    queryKey: ['payrolls', 'list', params],
    queryFn: () => {
      const searchParams = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
        month: params.month
      });
      if (params.employeeId) searchParams.append('employeeId', params.employeeId);
      if (params.search) searchParams.append('search', params.search);
      return api.get<Payroll[]>(`/payrolls?${searchParams.toString()}`);
    }
  });
}

export function useCalculatePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { month: string; employeeId?: string; deductions?: number }) => api.post('/payrolls/calculate', data),
    onSuccess: () => {
      toast.success('Payroll calculated');
      void queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}

export function useFinalizePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/payrolls/${id}/finalize`, {}),
    onSuccess: () => {
      toast.success('Payroll finalized');
      void queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    },
    onError: (e: Error) => toast.error(e.message)
  });
}
