'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createChallengeSchema, CreateChallengeInput } from '../schemas';
import { Plus, Trash2 } from 'lucide-react';

interface ChallengeFormProps {
  onSubmit: (data: CreateChallengeInput) => void;
  isSubmitting?: boolean;
}

export function ChallengeForm({ onSubmit, isSubmitting }: ChallengeFormProps) {
  const t = useTranslations();
  
  // Set default dates to today and next week
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const formatDateForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateChallengeInput>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      points: 10,
      type: 'TRIVIA',
      status: 'PUBLISHED',
      options: ['', ''], // 2 initial options
      startsAt: formatDateForInput(today),
      endsAt: formatDateForInput(nextWeek),
    }
  });

  const type = watch('type');
  const options = watch('options') || [];

  const handleAddOption = () => {
    setValue('options', [...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    setValue('options', options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setValue('options', newOptions);
  };

  const submitClean = (data: CreateChallengeInput) => {
    // Filter empty options
    if (data.options) {
      data.options = data.options.filter(o => o.trim() !== '');
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitClean)} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.title')}</label>
        <input {...register('title')} className="input w-full" />
        {errors.title?.message && <p className="text-xs text-rose-500 mt-1">{t(errors.title.message as Parameters<typeof t>[0])}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.type')}</label>
          <select {...register('type')} className="input w-full">
            <option value="TRIVIA">{t('arcade.types.TRIVIA')}</option>
            <option value="POLL">{t('arcade.types.POLL')}</option>
            <option value="CAPTION">{t('arcade.types.CAPTION')}</option>
            <option value="GUESS_COLLEAGUE">{t('arcade.types.GUESS_COLLEAGUE')}</option>
          </select>
        </div>
        {/* Points */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.points')}</label>
          <input type="number" {...register('points', { valueAsNumber: true })} className="input w-full" />
          {errors.points && <p className="text-xs text-rose-500 mt-1">{errors.points.message}</p>}
        </div>
      </div>

      {/* Question */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.question')}</label>
        <textarea {...register('question')} className="input w-full h-20" />
        {errors.question?.message && <p className="text-xs text-rose-500 mt-1">{t(errors.question.message as Parameters<typeof t>[0])}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.description')}</label>
        <textarea {...register('description')} className="input w-full h-16 text-sm" />
      </div>

      {/* Options for TRIVIA / POLL / GUESS_COLLEAGUE */}
      {(type === 'TRIVIA' || type === 'POLL' || type === 'GUESS_COLLEAGUE') && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="block text-xs font-bold text-slate-600">{t('arcade.fields.options')}</label>
          {options.map((opt, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input 
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="input flex-1" 
                placeholder={`Option ${index + 1}`}
              />
              <button 
                type="button" 
                onClick={() => handleRemoveOption(index)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button 
            type="button"
            onClick={handleAddOption}
            className="flex items-center gap-2 text-sm text-indigo-600 font-bold hover:underline"
          >
            <Plus size={16} /> {t('arcade.fields.addOption')}
          </button>
          
          {errors.options && <p className="text-xs text-rose-500">{errors.options.message}</p>}

          {/* Correct Answer for TRIVIA and GUESS_COLLEAGUE */}
          {(type === 'TRIVIA' || type === 'GUESS_COLLEAGUE') && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-600 mb-1">{t('arcade.fields.correctAnswer')}</label>
              <select {...register('correctAnswer')} className="input w-full">
                <option value="">-- Select correct answer --</option>
                {options.map((opt, i) => opt && (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.correctAnswer && <p className="text-xs text-rose-500 mt-1">{errors.correctAnswer.message}</p>}
            </div>
          )}
        </div>
      )}

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
