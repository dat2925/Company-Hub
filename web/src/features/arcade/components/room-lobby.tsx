'use client';
import { useState, useEffect } from 'react';
import { useMatchmakeRoom, useCurrentRoom, useRoomAction } from '../api';
import { useTranslations } from 'next-intl';
import { ArcadeRoomMode } from '../types';
import { Users, Loader2, LogOut, CheckCircle2 } from 'lucide-react';

export function RoomLobby() {
  const t = useTranslations();
  const { data: roomData, isLoading, refetch } = useCurrentRoom();
  const { mutate: matchmake, isPending: isMatchmaking } = useMatchmakeRoom();
  const { mutate: doAction, isPending: isActioning } = useRoomAction(roomData?.data?.id || '', 'ready'); // Will override action in call
  const { mutate: leave } = useRoomAction(roomData?.data?.id || '', 'leave');
  const { mutate: finish } = useRoomAction(roomData?.data?.id || '', 'finish');

  const [mode, setMode] = useState<ArcadeRoomMode>('ICEBREAKER');

  const room = roomData?.data;

  // Poll when waiting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (room && room.status === 'WAITING') {
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          refetch();
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [room, room?.status, refetch]);

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-indigo-500" /></div>;

  if (!room || room.status === 'FINISHED' || room.status === 'CANCELLED') {
    return (
      <div className="card bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-lg mb-4 text-slate-800">{t('arcade.room.matchmake')}</h3>
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mode" value="ICEBREAKER" checked={mode === 'ICEBREAKER'} onChange={() => setMode('ICEBREAKER')} className="text-indigo-600 focus:ring-indigo-600" />
            <span className="font-medium text-slate-700">{t('arcade.modes.ICEBREAKER')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mode" value="QUICK_QUIZ" checked={mode === 'QUICK_QUIZ'} onChange={() => setMode('QUICK_QUIZ')} className="text-indigo-600 focus:ring-indigo-600" />
            <span className="font-medium text-slate-700">{t('arcade.modes.QUICK_QUIZ')}</span>
          </label>
        </div>
        <button 
          onClick={() => matchmake({ mode })} 
          disabled={isMatchmaking}
          className="btn btn-primary w-full py-3 rounded-xl shadow-lg shadow-indigo-500/20"
        >
          {isMatchmaking ? <Loader2 className="animate-spin" size={18} /> : <Users size={18} />} 
          {t('arcade.room.matchmake')}
        </button>
      </div>
    );
  }

  // Active or Waiting Room
  const isWaiting = room.status === 'WAITING';
  
  return (
    <div className="card bg-white p-6 rounded-2xl border border-indigo-200 shadow-md">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
            {t(`arcade.modes.${room.mode}`)}
            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${isWaiting ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isWaiting ? t('arcade.room.waiting') : t('arcade.room.live')}
            </span>
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {t('arcade.room.code')} <span className="font-mono font-bold">{room.code}</span>
          </p>
        </div>
        <button onClick={() => leave()} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors" title={t('arcade.room.leave')}>
          <LogOut size={20} />
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{t('arcade.room.players')} ({room.members.length}/{room.maxPlayers})</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {room.members.map(m => (
            <div key={m.id} className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-100 relative">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-700 font-black rounded-full flex items-center justify-center mb-2">
                {m.employee.fullName.substring(0,2).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-center leading-tight">{m.employee.fullName}</span>
              {m.isReady && <CheckCircle2 size={14} className="text-emerald-500 absolute top-2 right-2" />}
            </div>
          ))}
          {Array.from({ length: room.maxPlayers - room.members.length }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed opacity-50">
              <span className="text-xs font-medium text-slate-400">{t('arcade.room.waitingSlot')}</span>
            </div>
          ))}
        </div>
      </div>

      {isWaiting ? (
        <button 
          onClick={() => doAction()} 
          disabled={isActioning}
          className="btn bg-indigo-600 hover:bg-indigo-500 text-white w-full py-3 rounded-xl shadow-lg shadow-indigo-500/20"
        >
          {t('arcade.room.ready')}
        </button>
      ) : (
        <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-100">
          <h4 className="text-indigo-800 font-bold mb-4">{t('arcade.room.activeTitle')}</h4>
          <p className="text-indigo-600/80 text-sm mb-6">{t('arcade.room.activeDesc')}</p>
          <button 
            onClick={() => finish()} 
            className="btn bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-600 hover:text-white px-6 py-2 rounded-xl transition-all"
          >
            {t('arcade.room.finish')}
          </button>
        </div>
      )}
    </div>
  );
}
