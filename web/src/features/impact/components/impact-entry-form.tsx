'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { impactEntrySchema, ImpactEntryFormValues } from '../schemas';
import { useCreateImpactEntry, useUpdateImpactEntry } from '../api';
import { ImpactEntry } from '../types';
import { Trophy, Calendar, Eye, X, Plus, Trash2, Star } from 'lucide-react';

type Props = {
  entry?: ImpactEntry | null;
  onClose: () => void;
  prefill?: Partial<ImpactEntryFormValues>;
};

export function ImpactEntryForm({ entry, onClose, prefill }: Props) {
  const t = useTranslations();
  const createMutation = useCreateImpactEntry();
  const updateMutation = useUpdateImpactEntry();
  
  const isEditing = !!entry;

  const form = useForm<ImpactEntryFormValues & { metricsArray: { key: string; value: string }[] }>({
    resolver: zodResolver(
      impactEntrySchema.extend({
        metricsArray: impactEntrySchema.shape.metrics.optional() // handled manually below
      }) as unknown as Parameters<typeof zodResolver>[0]
    ),
    defaultValues: {
      type: entry?.type || prefill?.type || 'DELIVERY',
      title: entry?.title || prefill?.title || '',
      description: entry?.description || prefill?.description || '',
      occurredOn: entry?.occurredOn ? entry.occurredOn.split('T')[0] : prefill?.occurredOn || new Date().toISOString().split('T')[0],
      projectId: entry?.projectId || prefill?.projectId || '',
      sourceIssueId: entry?.sourceIssueId || prefill?.sourceIssueId || '',
      visibility: entry?.visibility || prefill?.visibility || 'MANAGER',
      isHighlighted: entry?.isHighlighted || prefill?.isHighlighted || false,
      metricsArray: entry?.metrics 
        ? Object.entries(entry.metrics).map(([k, v]) => ({ key: k, value: String(v) })) 
        : []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "metricsArray"
  });

  const onSubmit = (data: ImpactEntryFormValues & { metricsArray: { key: string; value: string }[] }) => {
    const { metricsArray, ...rest } = data;
    
    const metrics: Record<string, string> = {};
    metricsArray.forEach((m: { key: string; value: string }) => {
      if (m.key.trim() && m.value.trim()) {
        metrics[m.key.trim()] = m.value.trim();
      }
    });

    const payload = { ...rest, metrics };

    if (isEditing) {
      updateMutation.mutate({ id: entry.id, ...payload }, {
        onSuccess: onClose
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: onClose
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            {isEditing ? t('common.modal.edit') : t('common.modal.create')}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form id="impact-entry-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Loại thành tích</label>
                <select {...form.register('type')} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                  {['DELIVERY', 'IMPROVEMENT', 'CUSTOMER_IMPACT', 'TEAM_SUPPORT', 'LEARNING', 'LEADERSHIP', 'OTHER'].map(tType => (
                    <option key={tType} value={tType}>{t(`impact.types.${tType}`)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Ngày ghi nhận</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="date" {...form.register('occurredOn')} className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
                {form.formState.errors.occurredOn && <p className="text-[10px] text-rose-500">{form.formState.errors.occurredOn.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Tiêu đề</label>
              <input type="text" {...form.register('title')} placeholder="Ví dụ: Hoàn thành refactor module thanh toán sớm 2 ngày" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              {form.formState.errors.title && <p className="text-[10px] text-rose-500">{form.formState.errors.title.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Mô tả chi tiết</label>
              <textarea {...form.register('description')} rows={3} placeholder="Mô tả cụ thể những gì bạn đã làm và kết quả đạt được..." className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none custom-scrollbar" />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">ID Dự án (nếu có)</label>
                <input type="text" {...form.register('projectId')} placeholder="Nhập ID hoặc chọn dự án" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Quyền riêng tư</label>
                <div className="relative">
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select {...form.register('visibility')} className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                    <option value="PRIVATE">{t('impact.visibility.PRIVATE')}</option>
                    <option value="MANAGER">{t('impact.visibility.MANAGER')}</option>
                    <option value="COMPANY">{t('impact.visibility.COMPANY')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase">Chỉ số đo lường (Metrics)</label>
                <button type="button" onClick={() => append({ key: '', value: '' })} className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors">
                  <Plus size={14} /> Thêm chỉ số
                </button>
              </div>
              
              {fields.length === 0 && (
                <p className="text-xs text-slate-400 italic">Chưa có chỉ số nào. Thêm các con số cụ thể (ví dụ: &quot;Tăng hiệu suất&quot;: &quot;20%&quot;) để làm nổi bật thành tích.</p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <input {...form.register(`metricsArray.${index}.key` as const)} placeholder="Tên chỉ số (vd: Giảm thời gian load)" className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500" />
                  <input {...form.register(`metricsArray.${index}.value` as const)} placeholder="Giá trị (vd: 50%)" className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-indigo-500" />
                  <button type="button" onClick={() => remove(index)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-4 group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" {...form.register('isHighlighted')} className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-slate-300 rounded group-hover:border-indigo-400 peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all"></div>
                <Star size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Đánh dấu là thành tích nổi bật (Highlight)</span>
            </label>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            {t('common.actions.cancel')}
          </button>
          <button type="submit" form="impact-entry-form" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-2">
            {(createMutation.isPending || updateMutation.isPending) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {t('common.actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
