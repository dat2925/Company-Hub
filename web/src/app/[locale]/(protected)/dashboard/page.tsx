'use client';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  FolderKanban,
  Network,
  Newspaper,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { api } from '@/lib/api/client';

const iconMap = {
  totalCompanies: Building2,
  activeCompanies: Building2,
  totalDepartments: Network,
  totalEmployees: Users,
  totalProjects: FolderKanban,
  upcomingMeetings: CalendarDays,
  totalBulletins: Newspaper,
  totalNotifications: Bell
};

const styleMap: Record<string, { gradient: string; shadow: string; text: string; bgSoft: string }> = {
  totalCompanies: { gradient: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/30', text: 'text-blue-600', bgSoft: 'bg-blue-50/70' },
  activeCompanies: { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30', text: 'text-emerald-600', bgSoft: 'bg-emerald-50/70' },
  totalDepartments: { gradient: 'from-violet-600 to-purple-600', shadow: 'shadow-violet-500/30', text: 'text-violet-600', bgSoft: 'bg-violet-50/70' },
  totalEmployees: { gradient: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/30', text: 'text-sky-600', bgSoft: 'bg-sky-50/70' },
  totalProjects: { gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30', text: 'text-amber-600', bgSoft: 'bg-amber-50/70' },
  upcomingMeetings: { gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/30', text: 'text-rose-600', bgSoft: 'bg-rose-50/70' },
  totalBulletins: { gradient: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/30', text: 'text-teal-600', bgSoft: 'bg-teal-50/70' },
  totalNotifications: { gradient: 'from-fuchsia-600 to-purple-600', shadow: 'shadow-fuchsia-500/30', text: 'text-fuchsia-600', bgSoft: 'bg-fuchsia-50/70' }
};

export default function Dashboard() {
  const t = useTranslations();
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(new Date().toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }));
  }, [locale]);

  const q = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get<Record<string, unknown>>('/dashboard'),
    enabled: !!user
  });

  const data = q.data?.data ?? {};
  const keys =
    user?.role === 'SUPER_ADMIN'
      ? ['totalCompanies', 'activeCompanies']
      : user?.role === 'ADMIN'
      ? ['totalDepartments', 'totalEmployees', 'totalProjects', 'upcomingMeetings', 'totalBulletins', 'totalNotifications']
      : ['totalProjects', 'upcomingMeetings'];

  const userName = user?.employee?.fullName ?? user?.email ?? '';

  return (
    <section className="space-y-10 perspective-2000 py-4 relative z-10">
      
      {/* 3D Cosmic Hero Banner */}
      <div className="stagger-item delay-100 transform-3d hover-extreme-3d cursor-default">
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-indigo-950/50 border border-white/20 glow-card">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-35 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-fuchsia-600/25 rounded-full blur-[120px] pointer-events-none glowing-orb-1"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/25 rounded-full blur-[100px] pointer-events-none glowing-orb-2"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex flex-col items-center gap-2 px-6 py-3 rounded-3xl bg-white/10 backdrop-blur-md text-xs font-black uppercase tracking-widest text-fuchsia-200 mb-6 border border-white/20 shadow-lg shadow-white/5 float-3d">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 animate-pulse" />
                {t('dashboard.title')} • {t('dashboard.subtitle')}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-indigo-200/90 tracking-wider">
                <span className="bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                  {user?.employee?.position?.name || (user?.role ? t(`roles.${user.role}`) : '')}
                </span>
                {currentDate && (
                  <>
                    <span className="opacity-50">•</span>
                    <span>{currentDate}</span>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              {tCommon('welcome')},{' '}
              <span className="bg-gradient-to-r from-amber-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                {userName || 'User'}
              </span>
            </h1>

            <p className="text-indigo-200/90 text-base sm:text-lg mt-4 max-w-2xl font-medium leading-relaxed">
              Welcome back to your high-performance enterprise hub. Real-time telemetry, company velocity, and team spotlights at your fingertips.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-indigo-100 flex items-center gap-2 shadow-sm">
                <ShieldCheck size={16} className="text-emerald-400" />
                Role: {user ? t(`roles.${user.role}`) : 'User'}
              </span>
              <span className="px-4 py-2 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-xs font-black text-emerald-300 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Dragon Engine Active
              </span>

            </div>
          </div>
        </div>
      </div>

      {/* CONTENT METRICS */}
      {q.isLoading ? (
        <div className="p-16 text-center text-indigo-600 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="font-bold text-lg animate-pulse">{t('common.loading')}</span>
        </div>
      ) : q.isError ? (
        <div className="p-8 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 font-bold text-center stagger-item shadow-sm">
          {t('common.error')}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Stat Cards 3D Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 perspective-2000">
            {keys.map((k, idx) => {
              const Icon = iconMap[k as keyof typeof iconMap];
              const styles = styleMap[k] ?? styleMap.totalCompanies;
              return (
                <article
                  className={`stagger-item delay-${((idx % 5) + 2) * 100} card p-7 relative overflow-hidden bg-white/80 backdrop-blur-2xl hover-extreme-3d glow-card border border-white/90 flex flex-col justify-between h-52 group cursor-default`}
                  key={k}
                >
                  <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-15 blur-2xl pointer-events-none bg-gradient-to-br transition-all duration-500 group-hover:opacity-35 group-hover:scale-125"></div>

                  <div className="flex justify-between items-start z-10 relative">
                    <span className={`p-4 rounded-2xl bg-gradient-to-br ${styles.gradient} text-white shadow-lg ${styles.shadow}`}>
                      <Icon size={26} />
                    </span>
                    <div className="text-right">
                      <strong className="text-4xl sm:text-5xl font-black text-slate-800 drop-shadow-xs block tracking-tight">
                        {String(data[k] ?? 0)}
                      </strong>
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mt-1">
                        <TrendingUp size={12} /> Live
                      </span>
                    </div>
                  </div>

                  <div className="z-10 relative mt-auto flex items-center justify-between pt-4 border-t border-slate-100/80">
                    <p className={`font-black text-xs uppercase tracking-widest ${styles.text}`}>
                      {t(`dashboard.cards.${k}`)}
                    </p>
                    <ChevronRight size={18} className={`opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ${styles.text}`} />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Super Admin Recent Companies */}
          {user?.role === 'SUPER_ADMIN' && Array.isArray(data.recentCompanies) && (
            <div className="stagger-item delay-400 card p-8 bg-white/80 backdrop-blur-2xl border border-white/90 glow-card hover-extreme-3d">
              <h2 className="font-black text-2xl text-slate-900 mb-6 flex items-center gap-3 title-gradient w-fit">
                <Building2 size={26} className="text-indigo-600" />
                {t('dashboard.recentCompanies')}
              </h2>
              <div className="grid gap-4">
                {data.recentCompanies.map((x: unknown, i: number) => (
                  <div
                    className={`p-5 rounded-2xl bg-white/80 border border-slate-200/60 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all stagger-item delay-${((i % 5) + 1) * 100}`}
                    key={(x as { id: string }).id}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Building2 size={20} />
                      </div>
                      <span className="font-bold text-slate-800 text-base">{(x as { name: string }).name}</span>
                    </div>
                    <span className="px-3.5 py-1 bg-emerald-100/80 text-emerald-700 rounded-full font-black text-xs uppercase tracking-widest border border-emerald-200/60 shadow-xs">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employee/Admin Recent Bulletins & Notifications */}
          {(user?.role === 'ADMIN' || user?.role === 'EMPLOYEE') && (
            <div className="grid lg:grid-cols-2 gap-8 perspective-2000">
              <Recent title={t('dashboard.recentBulletins')} items={data.recentBulletins} icon={Newspaper} delayClass="delay-400" />
              <Recent title={t('dashboard.recentNotifications')} items={data.recentNotifications} icon={Bell} delayClass="delay-500" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Recent({ title, items, icon: Icon, delayClass }: { title: string; items: unknown; icon: React.ElementType; delayClass: string }) {
  return (
    <div className={`stagger-item ${delayClass} card p-8 bg-white/80 backdrop-blur-2xl border border-white/90 glow-card hover-extreme-3d flex flex-col h-full`}>
      <h2 className="font-black text-2xl text-slate-900 mb-6 flex items-center gap-3 title-gradient w-fit">
        <Icon size={26} className="text-indigo-600" />
        {title}
      </h2>
      {Array.isArray(items) && items.length ? (
        <div className="grid gap-3.5 flex-1">
          {items.map((x: unknown, i: number) => (
            <div
              className={`group p-4 rounded-2xl bg-white/70 border border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between stagger-item delay-${((i % 5) + 1) * 100}`}
              key={(x as { id: string }).id}
            >
              <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">
                {(x as { title: string }).title}
              </span>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-slate-400 font-bold text-sm bg-slate-50/70 px-6 py-3 rounded-full border border-slate-100">
            No items available
          </p>
        </div>
      )}
    </div>
  );
}
