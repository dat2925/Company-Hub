'use client';
import { useState } from 'react';
import { useArcadeHome, useSubmitMission, useLeaderboard } from './api';
import { useTranslations } from 'next-intl';
import { Gamepad2, Medal, Zap, Trophy, Target, Star, Gift, Crown, UploadCloud, CheckCircle2 } from 'lucide-react';
import { ChallengePlayer } from './components/challenge-player';
import { RoomLobby } from './components/room-lobby';
import { EmployeeChallenge, EmployeeMission, ArcadeLeaderboardPeriod } from './types';
import { Dialog } from '@/components/ui/dialog';

export function EmployeeArcadeView() {
  const t = useTranslations();
  const { data, isLoading } = useArcadeHome();
  const [playingChallenge, setPlayingChallenge] = useState<EmployeeChallenge | null>(null);
  
  // Mission states
  const [missionProofText, setMissionProofText] = useState('');
  const [missionProofUrl, setMissionProofUrl] = useState('');
  const [activeMission, setActiveMission] = useState<EmployeeMission | null>(null);
  const { mutate: submitMission, isPending: isSubmitting } = useSubmitMission(activeMission?.id || '');

  const [lbPeriod, setLbPeriod] = useState<ArcadeLeaderboardPeriod>('WEEKLY');
  const { data: lbData } = useLeaderboard(lbPeriod);

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 font-bold animate-pulse">{t('common.loading')}</div>;
  }

  const profile = data?.data?.profile;
  const challenges = data?.data?.challenges || [];
  const missions = data?.data?.missions || [];
  const leaderboard = lbData?.data || data?.data?.leaderboard || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12">
      {/* Header Profile */}
      <div className="card p-6 sm:p-10 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 transform -rotate-3">
              <Gamepad2 size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{t('arcade.title')}</h1>
              <p className="text-indigo-200 font-medium mt-1">{t('arcade.description')}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl"><Trophy size={20} /></div>
              <div>
                <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">{t('arcade.points')}</p>
                <p className="text-xl font-black">{profile?.totalPoints || 0}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl"><Zap size={20} /></div>
              <div>
                <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">{t('arcade.streak')}</p>
                <p className="text-xl font-black">{profile?.streak || 0} 🔥</p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile?.badges && profile.badges.length > 0 && (
          <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Medal size={14} /> Badges
            </h4>
            <div className="flex flex-wrap gap-3">
              {profile.badges.map(b => (
                <div key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  {t(`arcade.badges.${b}`)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Challenges */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-indigo-500" />
              <h2 className="text-xl font-black text-slate-800">{t('arcade.tabs.challenges')}</h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {challenges.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-400 border border-dashed rounded-2xl">
                  {t('common.empty')}
                </div>
              )}
              {challenges.map(c => (
                <div key={c.id} className="card p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
                      {t(`arcade.types.${c.type}`)}
                    </span>
                    <span className="text-sm font-black text-amber-500 flex items-center gap-1">
                      <Trophy size={14} /> {c.points}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-4 line-clamp-2">{c.title}</h3>
                  
                  {c.hasPlayed ? (
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                        <CheckCircle2 size={16} /> {t('arcade.completed')}
                      </span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setPlayingChallenge(c)}
                      className="w-full btn bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white py-2 rounded-xl transition-colors"
                    >
                      {t('arcade.play')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Missions */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="text-rose-500" />
              <h2 className="text-xl font-black text-slate-800">{t('arcade.tabs.missions')}</h2>
            </div>
            
            <div className="space-y-4">
              {missions.length === 0 && (
                <div className="p-8 text-center text-slate-400 border border-dashed rounded-2xl">
                  {t('common.empty')}
                </div>
              )}
              {missions.map(m => {
                const sub = m.submissions?.[0];
                return (
                  <div key={m.id} className="card p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-800 text-lg">{m.title}</h3>
                        <span className="text-xs font-black text-amber-500 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                          <Trophy size={12} /> {m.points}
                        </span>
                      </div>
                      {m.description && <p className="text-sm text-slate-500">{m.description}</p>}
                      
                      {sub && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('arcade.fields.status')}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              sub.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                              sub.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {t(`arcade.statuses.${sub.status}`)}
                            </span>
                          </div>
                          {sub.managerComment && (
                            <p className="text-sm text-slate-600 italic">&quot; {sub.managerComment} &quot;</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {!sub && (
                      <div className="flex flex-col justify-center min-w-[140px]">
                        <button 
                          onClick={() => { setActiveMission(m); setMissionProofText(''); setMissionProofUrl(''); }}
                          className="btn btn-primary py-2.5 rounded-xl shadow-lg shadow-indigo-500/20"
                        >
                          <UploadCloud size={16} className="mr-2" />
                          {t('arcade.submit')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          {/* Room Lobby */}
          <RoomLobby />

          {/* Leaderboard */}
          <div className="card bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                <Crown className="text-amber-500" />
                {t('arcade.tabs.leaderboard')}
              </h3>
              <select 
                className="text-xs font-bold text-slate-600 bg-slate-50 border-none rounded-lg focus:ring-0"
                value={lbPeriod}
                onChange={e => setLbPeriod(e.target.value as ArcadeLeaderboardPeriod)}
              >
                <option value="WEEKLY">{t('arcade.periods.WEEKLY')}</option>
                <option value="MONTHLY">{t('arcade.periods.MONTHLY')}</option>
                <option value="ALL_TIME">{t('arcade.periods.ALL_TIME')}</option>
              </select>
            </div>

            <div className="space-y-4">
              {leaderboard.length === 0 && <p className="text-center text-sm text-slate-400 py-4">{t('common.empty')}</p>}
              {leaderboard.map((lb, idx) => (
                <div key={lb.employee.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-50 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm truncate">{lb.employee.fullName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">{lb.employee.department?.name || 'N/A'}</p>
                  </div>
                  <div className="font-black text-indigo-600">
                    {lb.points}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-6 mt-4 pt-4 border-t border-slate-100 italic">
              {t('arcade.noKPI')}
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Dialog */}
      <Dialog isOpen={!!playingChallenge} onClose={() => setPlayingChallenge(null)} title={playingChallenge?.title || t('arcade.challenge')}>
        {playingChallenge && (
          <ChallengePlayer 
            challenge={playingChallenge} 
            onComplete={() => setPlayingChallenge(null)} 
          />
        )}
      </Dialog>

      {/* Mission Submit Dialog */}
      <Dialog isOpen={!!activeMission} onClose={() => setActiveMission(null)} title={activeMission?.title || t('arcade.submitMission')}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{activeMission?.description}</p>
          
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">{t('arcade.proofTextOptional')}</label>
              <textarea 
                className="input w-full min-h-[100px]" 
                placeholder={t('arcade.proofTextPlaceholder')}
                value={missionProofText}
                onChange={e => setMissionProofText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">{t('arcade.proofUrlOptional')}</label>
              <input 
                type="url"
                className="input w-full" 
                placeholder="https://..."
                value={missionProofUrl}
                onChange={e => setMissionProofUrl(e.target.value)}
              />
            </div>
            
            <div className="pt-2 flex justify-end">
              <button 
                className="btn btn-primary px-6"
                disabled={isSubmitting || (!missionProofText && !missionProofUrl)}
                onClick={() => submitMission({ proofText: missionProofText, proofUrl: missionProofUrl }, { onSuccess: () => setActiveMission(null) })}
              >
                {isSubmitting ? t('common.loading') : t('common.actions.save')}
              </button>
            </div>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
