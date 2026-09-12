'use client';
import { Bell, BriefcaseBusiness, Building2, CalendarDays, FolderKanban, Gauge, Languages, ListChecks, LogOut, Menu, Network, Newspaper, UserRound, Users, X, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { Link, usePathname, useRouter } from '@/i18n/navigation';

const icons = { dashboard: Gauge, companies: Building2, departments: Network, positions: BriefcaseBusiness, employees: Users, meetings: CalendarDays, projects: FolderKanban, issues: ListChecks, bulletins: Newspaper, notifications: Bell, profile: UserRound };

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(); const t = useTranslations(); const path = usePathname(); const locale = useLocale(); const router = useRouter(); const [open, setOpen] = useState(false);

  if (loading) return (
    <div className="min-h-screen grid place-items-center bg-slate-50 relative overflow-hidden">
      <div className="animated-bg"></div>
      <div className="flex flex-col items-center gap-4 z-10 card p-8 rounded-3xl">
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-600 font-semibold">{t('common.loading')}</p>
      </div>
    </div>
  );
  if (!user) return null;

  const keys = user.role === 'SUPER_ADMIN' ? ['dashboard', 'companies', 'profile'] : user.role === 'ADMIN' ? ['dashboard', 'departments', 'positions', 'employees', 'meetings', 'projects', 'issues', 'bulletins', 'notifications', 'profile'] : ['dashboard', 'meetings', 'projects', 'issues', 'bulletins', 'notifications', 'profile'];

  const userName = user.employee?.fullName ?? user.email;
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : 'U';

  const nav = (
    <>
      <div className="p-6 flex items-center gap-4 font-extrabold text-xl text-slate-900 border-b border-white/20">
        <span className="bg-gradient-to-tr from-indigo-500 to-purple-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/30 hover-3d glass-reflection">
          <Building2 size={24} />
        </span>
        <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent float-3d" style={{ animationDuration: '6s' }}>
          {t('app.shortName')}
        </span>
      </div>

      <nav className="px-4 py-6 flex-1 space-y-1.5 overflow-y-auto">
        {keys.map(k => {
          const Icon = icons[k as keyof typeof icons];
          const href = k === 'dashboard' ? '/dashboard' : `/${k}`;
          const isActive = path === href;
          return (
            <Link
              key={k}
              href={href}
              onClick={() => setOpen(false)}
              className={`group flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-[0.95rem] transition-all duration-300 ${isActive
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 translate-x-1'
                : 'text-slate-600 hover:bg-white/50 hover:text-indigo-700 hover:translate-x-1'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500 transition-colors'} />
                {t(`nav.${k}`)}
              </div>
              {isActive && <ChevronRight size={16} className="opacity-70" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={() => void logout()}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 font-bold text-[0.95rem] text-rose-600 hover:text-white bg-rose-50/50 hover:bg-rose-500 rounded-2xl transition-all duration-300 shadow-sm"
        >
          <LogOut size={20} />
          {t('nav.logout')}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen relative flex">
      {/* Dynamic Background */}
      <div className="animated-bg"></div>

      {/* Desktop Floating Sidebar */}
      <aside className="desktop-sidebar floating-sidebar fixed top-6 bottom-6 left-6 w-[260px] rounded-3xl flex flex-col z-20">
        {nav}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 transition-opacity flex" onClick={() => setOpen(false)}>
          <aside className="w-72 h-full floating-sidebar rounded-r-3xl flex flex-col shadow-2xl animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</span>
              <button className="p-2 text-slate-500 hover:text-slate-800 bg-white/50 hover:bg-white rounded-xl transition-all" onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[290px] flex flex-col min-h-screen w-full px-4 md:pr-6 md:py-6">

        {/* Floating Header */}
        <header className="floating-header h-16 md:h-20 rounded-full flex items-center justify-between px-6 z-10 w-full mb-6 mt-4 md:mt-0 transition-all">
          <div className="flex items-center gap-4">
            <button className="mobile-only p-2 rounded-xl text-slate-600 bg-white/50 hover:bg-white hover:text-indigo-600 transition-all shadow-sm" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm md:text-base flex items-center justify-center shadow-md shadow-indigo-500/30 ring-2 ring-white/50 cursor-pointer hover-3d">
                {userInitials}
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-[0.95rem] text-slate-800 leading-tight">{userName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="bg-indigo-100/80 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest border border-indigo-200/60 shadow-sm">
                    {t(`roles.${user.role}`)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn bg-white/60 hover:bg-white text-slate-700 hover:text-indigo-600 text-xs rounded-full px-4 py-2 shadow-sm border border-white/80 hover:border-indigo-300 flex items-center gap-2 transition-all group"
            onClick={() => router.replace(path, { locale: locale === 'vi' ? 'en' : 'vi' })}
          >
            <Languages size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="font-extrabold tracking-wide">{locale === 'vi' ? 'English' : 'Tiếng Việt'}</span>
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full animate-in fade-in duration-500">
          <div className="h-full rounded-3xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
