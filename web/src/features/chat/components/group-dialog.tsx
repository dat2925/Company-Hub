'use client';


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGroupSchema, CreateGroupInput } from '../schemas';
import { chatApi } from '../api';
import { useTranslations } from 'next-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '../query-keys';
import { Check } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Reusing employee options logic
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function GroupDialog({
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

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { title: '', icon: '', theme: 'DEFAULT', memberIds: [] }
  });

  const selectedMembers = watch('memberIds');

  const toggleMember = (id: string) => {
    const current = selectedMembers || [];
    if (current.includes(id)) {
      setValue('memberIds', current.filter(m => m !== id), { shouldValidate: true });
    } else {
      setValue('memberIds', [...current, id], { shouldValidate: true });
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateGroupInput) => chatApi.createGroup(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
      reset();
      onSuccess(res.data.id);
      onClose();
    },
    onError: () => toast.error(tCommon('error'))
  });

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('newGroup')}>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4 py-2">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 block">{t('group.name')}</label>
            <Input {...register('title')} placeholder="Nhập tên nhóm..." />
            {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 block">Icon (Emoji)</label>
            <Input {...register('icon')} placeholder="Ví dụ: 🚀, 💻..." maxLength={16} />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              {t('group.members')}
              <span className="text-indigo-600 font-normal">{selectedMembers.length} selected</span>
            </label>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
              {isLoadingEmployees ? (
                <p className="text-center text-sm text-slate-400 p-2">{tCommon('loading')}</p>
              ) : employees.map(emp => {
                const isSelected = selectedMembers.includes(emp.id);
                return (
                  <div 
                    key={emp.id}
                    onClick={() => toggleMember(emp.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-100 border border-indigo-200' : 'hover:bg-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {emp.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{emp.fullName}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-indigo-600" />}
                  </div>
                );
              })}
            </div>
            {errors.memberIds && <p className="text-rose-500 text-xs mt-1">{errors.memberIds.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>{tCommon('actions.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>{tCommon('actions.create')}</Button>
          </div>
        </form>
    </Dialog>
  );
}
