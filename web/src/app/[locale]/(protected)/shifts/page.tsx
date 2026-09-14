'use client';

import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { ShiftsTab } from './_components/shifts-tab';
import { AssignmentsTab } from './_components/assignments-tab';

export default function ShiftsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'shifts' | 'assignments'>(isAdmin ? 'shifts' : 'assignments');

  return (
    <section className="space-y-6 md:space-y-8 py-4 perspective-2000 relative z-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 stagger-item delay-100">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight title-gradient flex items-center gap-4">
            <CalendarDays size={40} className="text-indigo-600 hidden md:block" />
            <CalendarDays size={28} className="text-indigo-600 md:hidden" />
            {t('shifts.title')}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl text-sm md:text-base">
            {t('shifts.description')}
          </p>
        </div>
      </div>

      <div className="stagger-item delay-200">
        {isAdmin ? (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/90 shadow-xl overflow-hidden">
            <div className="flex border-b border-slate-100/80 p-2 md:p-3 gap-2 bg-slate-50/50">
              <button
                className={`flex-1 py-3 px-6 text-sm md:text-base font-black rounded-xl transition-all flex justify-center items-center gap-2 ${
                  activeTab === 'shifts'
                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-100 scale-[1.02]'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-white/60'
                }`}
                onClick={() => setActiveTab('shifts')}
              >
                {t('shifts.tabs.shifts')}
              </button>
              <button
                className={`flex-1 py-3 px-6 text-sm md:text-base font-black rounded-xl transition-all flex justify-center items-center gap-2 ${
                  activeTab === 'assignments'
                    ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-100 scale-[1.02]'
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-white/60'
                }`}
                onClick={() => setActiveTab('assignments')}
              >
                {t('shifts.tabs.assignments')}
              </button>
            </div>
            
            <div className="p-4 md:p-6">
              {activeTab === 'shifts' ? <ShiftsTab t={t} /> : <AssignmentsTab t={t} isAdmin={true} />}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white/90 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-black text-slate-800">{t('shifts.tabs.mySchedule')}</h2>
            </div>
            <div className="p-4 md:p-6">
              <AssignmentsTab t={t} isAdmin={false} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
