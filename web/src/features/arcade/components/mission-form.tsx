'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createMissionSchema, CreateMissionInput } from '../schemas';

interface MissionFormProps {
  onSubmit: (data: CreateMissionInput) => void;
  isSubmitting?: boolean;
}

export function MissionForm({ onSubmit, isSubmitting }: MissionFormProps) {
  const t = useTranslations();
  
  // Set default dates to today and next week
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDateForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const { register, handleSubmit, formState: { errors } } = useForm<CreateMissionInput>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: {
      points: 20,
      requiresProof: true,
      status: 'PUBLISHED',
      startsAt: formatDateForInput(today),
      endsAt: formatDateForInput(nextWeek),
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.title')}</label>
        <input {...register('title')} className="input w-full" />
        {errors.title?.message && <p className="text-xs text-rose-500 mt-1">{t(errors.title.message as Parameters<typeof t>[0])}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.description')}</label>
        <textarea {...register('description')} className="input w-full h-24" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Points */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.points')}</label>
          <input type="number" {...register('points', { valueAsNumber: true })} className="input w-full" />
          {errors.points && <p className="text-xs text-rose-500 mt-1">{errors.points.message}</p>}
        </div>
        
        {/* Requires Proof */}
        <div className="flex flex-col justify-center">
          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <input type="checkbox" {...register('requiresProof')} className="w-5 h-5 text-indigo-600 rounded" />
            <span className="text-sm font-bold text-slate-700">{t('arcade.fields.requiresProof')}</span>
          </label>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.startsAt')}</label>
          <input type="datetime-local" {...register('startsAt')} className="input w-full" />
          {errors.startsAt?.message && <p className="text-xs text-rose-500 mt-1">{t(errors.startsAt.message as Parameters<typeof t>[0])}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.endsAt')}</label>
          <input type="datetime-local" {...register('endsAt')} className="input w-full" />
          {errors.endsAt?.message && <p className="text-xs text-rose-500 mt-1">{t(errors.endsAt.message as Parameters<typeof t>[0])}</p>}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="btn btn-primary px-8">
          {isSubmitting ? t('common.loading') : t('common.actions.save')}
        </button>
      </div>
    </form>
  );
}
