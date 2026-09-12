'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, CircleDot, ClipboardList, FileText, FolderKanban, Hash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { api } from '@/lib/api/client';
import { Item } from '@/types';
import { configs } from '@/features/crud/config';
import { CrudPage } from '@/features/crud/crud-page';

type Tab = 'details' | 'issues';

const asDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
};

export function ProjectDetail({ projectId }: { projectId: string }) {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>('details');
  const project = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => api.get<Item>(`/projects/${projectId}`)
  });

  if (project.isLoading) {
    return <div className="min-h-96 grid place-items-center"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;
  }

  if (project.isError || !project.data?.data) {
    return (
      <div className="card p-12 text-center">
        <p className="font-bold text-rose-600 mb-6">{t('projectDetail.notFound')}</p>
        <Link href="/projects" className="btn btn-secondary inline-flex">{t('projectDetail.back')}</Link>
      </div>
    );
  }

  const data = project.data.data;
  const status = typeof data.status === 'string' ? data.status : 'PLANNING';

  const details = [
    { label: t('fields.code'), value: String(data.code ?? '—'), icon: Hash },
    { label: t('fields.status'), value: t(`statuses.${status}`), icon: CircleDot },
    { label: t('fields.startDate'), value: asDate(data.startDate), icon: CalendarDays },
    { label: t('fields.endDate'), value: asDate(data.endDate), icon: CalendarDays }
  ];

  return (
    <section className="space-y-6 py-4">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft size={18} />
        {t('projectDetail.back')}
      </Link>

      <div className="bg-white/85 border border-white/90 rounded-[2.5rem] shadow-2xl">
        <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white relative overflow-hidden rounded-t-[2.5rem]">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-white/15 border border-white/20 shadow-xl">
              <FolderKanban size={28} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100 mb-1">{String(data.code ?? '')}</p>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{String(data.name ?? '')}</h1>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-8 pt-5 border-b border-slate-200/70 bg-slate-50/60">
          <div className="flex gap-2" role="tablist" aria-label={t('projectDetail.tabsLabel')}>
            <button
              role="tab"
              aria-selected={tab === 'details'}
              onClick={() => setTab('details')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all ${tab === 'details' ? 'bg-white text-indigo-600 border border-b-white border-slate-200 -mb-px' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              <FileText size={18} /> {t('projectDetail.tabs.details')}
            </button>
            <button
              role="tab"
              aria-selected={tab === 'issues'}
              onClick={() => setTab('issues')}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm transition-all ${tab === 'issues' ? 'bg-white text-indigo-600 border border-b-white border-slate-200 -mb-px' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              <ClipboardList size={18} /> {t('projectDetail.tabs.issues')}
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {tab === 'details' ? (
            <div className="space-y-6" role="tabpanel">
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {details.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <div className="flex items-center gap-2 text-indigo-500 mb-2"><Icon size={17} /><span className="text-[10px] font-black uppercase tracking-widest">{label}</span></div>
                    <p className="font-black text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <h2 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">{t('fields.description')}</h2>
                <p className="text-slate-700 font-medium whitespace-pre-wrap leading-7">{String(data.description ?? t('projectDetail.noDescription'))}</p>
              </div>
            </div>
          ) : (
            <div role="tabpanel">
              <CrudPage
                config={configs.issues}
                queryParams={{ projectId }}
                fixedValues={{ projectId }}
                hiddenFields={['projectId']}
                embedded
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
