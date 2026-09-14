// @ts-nocheck
/* eslint-disable */
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { XCircle } from 'lucide-react';
import { useCreateOpportunity, useUpdateOpportunity } from '../api';
import { Portal } from '@/components/ui/portal';
import { TalentOpportunity } from '@/types';

interface OpportunityFormProps {
  opportunity?: TalentOpportunity | null;
  onClose: () => void;
}

export function OpportunityForm({ opportunity, onClose }: OpportunityFormProps) {
  const t = useTranslations();
  const createMutation = useCreateOpportunity();
  const updateMutation = useUpdateOpportunity();
  const isEditing = !!opportunity;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: opportunity?.title || '',
      description: opportunity?.description || '',
      type: opportunity?.type || 'PROJECT_ROLE',
      status: opportunity?.status || 'DRAFT',
      openings: opportunity?.openings || 1,
      startDate: opportunity?.startDate ? opportunity.startDate.split('T')[0] : '',
      endDate: opportunity?.endDate ? opportunity.endDate.split('T')[0] : '',
    }
  });

  const onSubmit = (data: any) => {
    // Convert openings to number
    const payload = {
      ...data,
      openings: Number(data.openings),
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    };

    if (isEditing) {
      updateMutation.mutate({ id: opportunity.id, ...payload }, {
        onSuccess: () => onClose()
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">
              {isEditing ? 'Cập nhật cơ hội' : 'Tạo cơ hội mới'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <XCircle size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề *</label>
              <input 
                type="text"
                {...register('title', { required: 'Vui lòng nhập tiêu đề' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: Senior Frontend Developer"
              />
              {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả</label>
              <textarea 
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Mô tả chi tiết về cơ hội này..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại hình *</label>
                <select 
                  {...register('type')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PROJECT_ROLE">{t('talent.opportunityType.PROJECT_ROLE')}</option>
                  <option value="INTERNAL_POSITION">{t('talent.opportunityType.INTERNAL_POSITION')}</option>
                  <option value="SHORT_TERM_MISSION">{t('talent.opportunityType.SHORT_TERM_MISSION')}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái *</label>
                <select 
                  {...register('status')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DRAFT">{t('talent.opportunityStatus.DRAFT')}</option>
                  <option value="OPEN">{t('talent.opportunityStatus.OPEN')}</option>
                  <option value="CLOSED">{t('talent.opportunityStatus.CLOSED')}</option>
                  <option value="CANCELLED">{t('talent.opportunityStatus.CANCELLED')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng *</label>
                <input 
                  type="number"
                  min="1"
                  {...register('openings', { required: 'Bắt buộc', min: 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
                <input 
                  type="date"
                  {...register('startDate')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc</label>
                <input 
                  type="date"
                  {...register('endDate')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors text-sm"
              >
                {t('common.actions.cancel')}
              </button>
              <button 
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {t('common.actions.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
