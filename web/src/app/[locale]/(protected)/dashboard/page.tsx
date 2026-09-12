'use client';
import {useQuery} from '@tanstack/react-query';
import {Bell,Building2,CalendarDays,FolderKanban,Network,Newspaper,Sparkles,Users,ChevronRight} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {api} from '@/lib/api/client';
import {useAuth} from '@/features/auth/auth-context';

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

const styleMap: Record<string, { gradient: string; shadow: string; text: string }> = {
  totalCompanies: { gradient: 'from-blue-600 to-indigo-600', shadow: 'shadow-blue-500/30', text: 'text-blue-500' },
  activeCompanies: { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30', text: 'text-emerald-500' },
  totalDepartments: { gradient: 'from-violet-600 to-purple-600', shadow: 'shadow-violet-500/30', text: 'text-violet-500' },
  totalEmployees: { gradient: 'from-sky-500 to-blue-500', shadow: 'shadow-sky-500/30', text: 'text-sky-500' },
  totalProjects: { gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/30', text: 'text-amber-500' },
  upcomingMeetings: { gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/30', text: 'text-rose-500' },
  totalBulletins: { gradient: 'from-teal-500 to-emerald-500', shadow: 'shadow-teal-500/30', text: 'text-teal-500' },
  totalNotifications: { gradient: 'from-fuchsia-600 to-purple-600', shadow: 'shadow-fuchsia-500/30', text: 'text-fuchsia-500' }
};

export default function Dashboard(){
  const t=useTranslations();
  const{user}=useAuth();
  const q=useQuery({
    queryKey:['dashboard'],
    queryFn:()=>api.get<Record<string,unknown>>('/dashboard'),
    enabled:!!user
  });

  const data=q.data?.data??{};
  const keys=user?.role==='SUPER_ADMIN'
    ?['totalCompanies','activeCompanies']
    :user?.role==='ADMIN'
    ?['totalDepartments','totalEmployees','totalProjects','upcomingMeetings','totalBulletins','totalNotifications']
    :['totalProjects','upcomingMeetings'];

  const userName = user?.employee?.fullName ?? user?.email ?? '';

  return (
    <section className="space-y-10 perspective-2000 py-6">
      {/* 3D Hero Banner */}
      <div className="stagger-item delay-100 transform-3d hover-extreme-3d cursor-default">
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-8 sm:p-12 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-purple-900/40 border border-white/10 glow-card">
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none mix-blend-overlay"></div>
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-fuchsia-600/30 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/30 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sm font-bold text-fuchsia-200 mb-6 border border-white/20 shadow-lg shadow-white/5 float-3d">
              <Sparkles size={16} className="text-amber-400 animate-pulse"/>
              {t('dashboard.title')}
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-fuchsia-200 leading-tight drop-shadow-lg">
              {t('dashboard.welcome',{name: userName})}
            </h1>
            <p className="text-indigo-200/80 text-lg mt-4 max-w-2xl font-medium">
              Explore your spectacular 3D dashboard. Everything is interactive.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {q.isLoading ? (
        <div className="p-12 text-center text-indigo-500 flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="font-bold text-lg animate-pulse">{t('common.loading')}</span>
        </div>
      ) : q.isError ? (
        <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 font-bold text-center stagger-item">
          {t('common.error')}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Stat Cards 3D Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 perspective-2000">
            {keys.map((k, idx)=>{
              const Icon=iconMap[k as keyof typeof iconMap];
              const styles=styleMap[k] ?? styleMap.totalCompanies;
              return (
                <article 
                  className={`stagger-item delay-${(idx % 5 + 2) * 100} card p-8 relative overflow-hidden bg-white/70 backdrop-blur-xl hover-extreme-3d glow-card border border-white/60 flex flex-col justify-between h-48`} 
                  key={k}
                >
                  <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none bg-gradient-to-br transition-all duration-500 group-hover:opacity-30 group-hover:scale-150"></div>
                  <div className="flex justify-between items-start z-10 relative">
                    <span className={`p-4 rounded-2xl bg-gradient-to-br ${styles.gradient} text-white shadow-xl ${styles.shadow}`}>
                      <Icon size={28}/>
                    </span>
                    <strong className="text-4xl sm:text-5xl font-black text-slate-800 drop-shadow-sm">
                      {String(data[k]??0)}
                    </strong>
                  </div>
                  <div className="z-10 relative mt-auto flex items-center justify-between">
                    <p className={`font-black text-sm uppercase tracking-widest ${styles.text}`}>
                      {t(`dashboard.cards.${k}`)}
                    </p>
                    <ChevronRight size={18} className={`opacity-0 -translate-x-4 transition-all duration-300 ${styles.text}`} />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Super Admin Recent Companies */}
          {user?.role==='SUPER_ADMIN'&&Array.isArray(data.recentCompanies)&&(
            <div className="stagger-item delay-500 card p-8 bg-white/80 backdrop-blur-xl border border-white/60 glow-card transform-3d hover-extreme-3d">
              <h2 className="font-black text-2xl text-slate-900 mb-6 flex items-center gap-3 title-gradient w-fit">
                <Building2 size={28} className="text-indigo-600"/>
                {t('dashboard.recentCompanies')}
              </h2>
              <div className="grid gap-4">
                {data.recentCompanies.map((x:unknown, i:number)=>(
                  <div className={`p-5 rounded-2xl bg-white/60 border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-1 transition-all stagger-item delay-${(i % 5 + 1)*100}`} key={(x as {id:string}).id}>
                    <span className="font-bold text-slate-800 text-lg">{(x as {name:string}).name}</span>
                    <span className="px-3 py-1 bg-emerald-100/80 text-emerald-700 rounded-full font-black text-xs uppercase tracking-widest border border-emerald-200/50 shadow-sm shadow-emerald-500/10">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employee Recent Bulletins & Notifications */}
          {user?.role==='EMPLOYEE'&&(
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

function Recent({title,items,icon:Icon,delayClass}:{title:string;items:unknown;icon:React.ElementType;delayClass:string}){
  return (
    <div className={`stagger-item ${delayClass} card p-8 bg-white/80 backdrop-blur-xl border border-white/60 glow-card hover-extreme-3d flex flex-col h-full`}>
      <h2 className="font-black text-2xl text-slate-900 mb-6 flex items-center gap-3 title-gradient w-fit">
        <Icon size={28} className="text-indigo-600"/>
        {title}
      </h2>
      {Array.isArray(items)&&items.length ? (
        <div className="grid gap-3">
          {items.map((x:unknown, i:number)=>(
            <div className={`group p-4 rounded-2xl bg-white/50 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer flex items-center justify-between stagger-item delay-${(i%5+1)*100}`} key={(x as {id:string}).id}>
              <span className="font-semibold text-slate-700 group-hover:text-indigo-700">{(x as {title:string}).title}</span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 font-bold bg-slate-50/50 px-6 py-3 rounded-full border border-slate-100/50">Nothing new here</p>
        </div>
      )}
    </div>
  );
}
