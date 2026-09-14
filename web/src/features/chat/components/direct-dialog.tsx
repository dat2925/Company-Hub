'use client';


import { chatApi } from '../api';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '../query-keys';
import { Dialog } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { MessageCircle } from 'lucide-react';

export function DirectDialog({
  isOpen,
  onClose,
  onSuccess
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}) {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees-options'],
    queryFn: () => api.get<{ id: string; fullName: string; department?: { name: string } }[]>('/employees/options/list'),
    enabled: isOpen
  });

  const employees = employeesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (employeeId: string) => chatApi.createDirect({ employeeId }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
      onSuccess(res.data.id);
      onClose();
    },
    onError: () => toast.error(tCommon('error'))
  });

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('newDirect')}>
        <div className="space-y-4 py-2">
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50 custom-scrollbar">
            {isLoadingEmployees ? (
              <p className="text-center text-sm text-slate-400 p-4">{tCommon('loading')}</p>
            ) : employees.length === 0 ? (
              <p className="text-center text-sm text-slate-400 p-4">Không có nhân viên nào khác</p>
            ) : employees.map(emp => (
              <div 
                key={emp.id}
                onClick={() => createMutation.mutate(emp.id)}
                className="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-200 border border-transparent hover:border-slate-300 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                    {emp.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-700 block">{emp.fullName}</span>
                    {emp.department && <span className="text-[10px] text-slate-500">{emp.department.name}</span>}
                  </div>
                </div>
                <MessageCircle size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
    </Dialog>
  );
}
