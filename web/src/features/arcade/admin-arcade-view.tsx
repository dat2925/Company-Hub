'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useChallenges, useMissions, useMissionSubmissions, useReviewSubmission, useLeaderboard, useCreateChallenge, useCreateMission } from './api';
import { ArcadeLeaderboardPeriod } from './types';
import { Gamepad2, Gift, ClipboardCheck, Crown, ShieldAlert } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ChallengeForm } from './components/challenge-form';
import { MissionForm } from './components/mission-form';

export function AdminArcadeView() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'challenges' | 'missions' | 'submissions' | 'leaderboard'>('challenges');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Gamepad2 className="text-indigo-600" size={32} />
            {t('arcade.adminTitle')}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">{t('arcade.adminDescription')}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 text-amber-800 text-sm">
        <ShieldAlert size={20} className="shrink-0 text-amber-600" />
        <div>
          <strong className="block mb-1">{t('arcade.attention')}</strong>
          <p>{t('arcade.noKPI')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 p-1 bg-slate-100 rounded-2xl">
        {[
          { id: 'challenges', label: t('arcade.tabs.challenges'), icon: Gamepad2 },
          { id: 'missions', label: t('arcade.tabs.missions'), icon: Gift },
          { id: 'submissions', label: t('arcade.tabs.submissions'), icon: ClipboardCheck },
          { id: 'leaderboard', label: t('arcade.tabs.leaderboard'), icon: Crown },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'challenges' | 'missions' | 'submissions' | 'leaderboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
        {activeTab === 'challenges' && <AdminChallenges />}
        {activeTab === 'missions' && <AdminMissions />}
        {activeTab === 'submissions' && <AdminSubmissions />}
        {activeTab === 'leaderboard' && <AdminLeaderboard />}
      </div>
    </div>
  );
}

function AdminChallenges() {
  const { data, isLoading } = useChallenges({ page: 1, pageSize: 50 });
  const t = useTranslations();
  const [isCreating, setIsCreating] = useState(false);
  const { mutate: create, isPending } = useCreateChallenge();

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{t('arcade.tabs.challenges')}</h2>
        <button onClick={() => setIsCreating(true)} className="btn btn-primary px-4 py-2 rounded-xl text-sm">
          {t('arcade.createChallenge')}
        </button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.title')}</th>
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.type')}</th>
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.status')}</th>
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.points')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data?.data?.map(c => (
            <tr key={c.id}>
              <td className="px-4 py-3 font-medium text-slate-800">{c.title}</td>
              <td className="px-4 py-3 text-sm">{c.type}</td>
              <td className="px-4 py-3 text-sm">{c.status}</td>
              <td className="px-4 py-3 text-sm font-bold text-amber-500">{c.points}</td>
            </tr>
          ))}
          {!data?.data?.length && <tr><td colSpan={4} className="text-center p-8 text-slate-400">{t('arcade.noChallenges')}</td></tr>}
        </tbody>
      </table>

      <Dialog isOpen={isCreating} onClose={() => setIsCreating(false)} title={t('arcade.createChallenge')}>
        <ChallengeForm 
          onSubmit={(v) => create(v, { onSuccess: () => setIsCreating(false) })} 
          isSubmitting={isPending} 
        />
      </Dialog>
    </div>
  );
}

function AdminMissions() {
  const { data, isLoading } = useMissions({ page: 1, pageSize: 50 });
  const t = useTranslations();
  const [isCreating, setIsCreating] = useState(false);
  const { mutate: create, isPending } = useCreateMission();

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{t('arcade.tabs.missions')}</h2>
        <button onClick={() => setIsCreating(true)} className="btn btn-primary px-4 py-2 rounded-xl text-sm">
          {t('arcade.createMission')}
        </button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.title')}</th>
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.status')}</th>
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.points')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data?.data?.map(m => (
            <tr key={m.id}>
              <td className="px-4 py-3 font-medium text-slate-800">{m.title}</td>
              <td className="px-4 py-3 text-sm">{m.status}</td>
              <td className="px-4 py-3 text-sm font-bold text-amber-500">{m.points}</td>
            </tr>
          ))}
          {!data?.data?.length && <tr><td colSpan={3} className="text-center p-8 text-slate-400">{t('arcade.noMissions')}</td></tr>}
        </tbody>
      </table>

      <Dialog isOpen={isCreating} onClose={() => setIsCreating(false)} title={t('arcade.createMission')}>
        <MissionForm 
          onSubmit={(v) => create(v, { onSuccess: () => setIsCreating(false) })} 
          isSubmitting={isPending} 
        />
      </Dialog>
    </div>
  );
}

function AdminSubmissions() {
  const { data, isLoading } = useMissionSubmissions({ page: 1, pageSize: 50, status: 'PENDING' });
  const t = useTranslations();
  const { mutate: review, isPending } = useReviewSubmission('');

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t('arcade.pendingSubmissions')}</h2>
      <div className="space-y-4">
        {!data?.data?.length && <div className="text-center p-8 text-slate-400">{t('arcade.noSubmissions')}</div>}
        {data?.data?.map(s => (
          <div key={s.id} className="p-4 border rounded-xl flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="font-bold">{s.employee.fullName}</p>
              {s.proofText && <p className="text-sm mt-2 text-slate-600 bg-slate-50 p-2 rounded">&quot;{s.proofText}&quot;</p>}
              {s.proofUrl && <a href={s.proofUrl} target="_blank" className="text-sm text-indigo-500 hover:underline mt-1 block">{t('arcade.viewProof')}</a>}
            </div>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => review({ status: 'APPROVED', managerComment: 'Good job!' })}
                disabled={isPending}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors text-sm font-bold"
              >
                {t('arcade.approve')}
              </button>
              <button 
                onClick={() => review({ status: 'REJECTED' })}
                disabled={isPending}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-500 hover:text-white rounded-lg transition-colors text-sm font-bold"
              >
                {t('arcade.reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminLeaderboard() {
  const [period, setPeriod] = useState<ArcadeLeaderboardPeriod>('WEEKLY');
  const { data, isLoading } = useLeaderboard(period);
  const t = useTranslations();

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{t('arcade.tabs.leaderboard')}</h2>
        <select 
          className="input py-2 text-sm font-bold rounded-lg"
          value={period}
          onChange={e => setPeriod(e.target.value as ArcadeLeaderboardPeriod)}
        >
          <option value="WEEKLY">{t('arcade.periods.WEEKLY')}</option>
          <option value="MONTHLY">{t('arcade.periods.MONTHLY')}</option>
          <option value="ALL_TIME">{t('arcade.periods.ALL_TIME')}</option>
        </select>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.rank')}</th>
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.employee')}</th>
            <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">{t('arcade.fields.points')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data?.data?.map((lb, idx) => (
            <tr key={lb.employee.id}>
              <td className="px-4 py-3 font-bold">{idx + 1}</td>
              <td className="px-4 py-3">{lb.employee.fullName}</td>
              <td className="px-4 py-3 font-black text-indigo-600">{lb.points}</td>
            </tr>
          ))}
          {!data?.data?.length && <tr><td colSpan={3} className="text-center p-8 text-slate-400">{t('common.empty')}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
