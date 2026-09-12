'use client';
import {
  Banknote,
  Bell,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Clock,
  FolderKanban,
  Gauge,
  Languages,
  LogOut,
  Menu,
  Network,
  Newspaper,
  UserRound,
  Users,
  X,
  Zap
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { FlyingDragon } from '@/components/flying-dragon';

const icons = {
  dashboard: Gauge,
  companies: Building2,
  departments: Network,
  employees: Users,
  attendance: CalendarCheck,
  payrolls: Banknote,
  meetings: CalendarDays,
  projects: FolderKanban,
  bulletins: Newspaper,
  notifications: Bell,
  profile: UserRound
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const t = useTranslations();
  const path = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(locale === 'vi' ? 'vi-VN' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000); // update every second for accuracy
    return () => clearInterval(timer);
  }, [locale]);

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 relative overflow-hidden">
        <div className="animated-bg"></div>
        <div className="flex flex-col items-center gap-4 z-10 card p-10 rounded-3xl border border-white/20 shadow-2xl bg-slate-900/80 backdrop-blur-2xl">
          <div className="w-14 h-14 border-4 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-indigo-200 font-bold text-lg animate-pulse">{t('common.loading')}</p>
        </div>
      </div>
    );
  if (!user) return null;

  const departmentPermission = user.employee?.departmentPermission;
  const canManageDepartment = Boolean(
    departmentPermission &&
      (departmentPermission.canCreate ||
        departmentPermission.canUpdate ||
        departmentPermission.canDelete ||
        departmentPermission.canAssignPosition)
  );

  const keys =
    user.role === 'SUPER_ADMIN'
      ? ['dashboard', 'companies', 'profile']
      : user.role === 'ADMIN'
      ? ['dashboard', 'departments', 'employees', 'attendance', 'payrolls', 'meetings', 'projects', 'bulletins', 'notifications', 'profile']
      : ['dashboard', ...(canManageDepartment ? ['departments'] : []), 'attendance', 'payrolls', 'meetings', 'projects', 'bulletins', 'notifications', 'profile'];

  const userName = user.employee?.fullName ?? user.email;
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : 'U';
  const companyName = user.company?.name ?? t('app.name');

  // Categorized Navigation Groups
  const coreGroup = ['dashboard', 'attendance', 'payrolls', 'projects', 'meetings'];
  const orgGroup = ['departments', 'employees', 'bulletins'];
  const systemGroup = ['companies', 'notifications', 'profile'];

  const renderNavGroup = (groupKeys: string[], label: string) => {
    const validKeys = groupKeys.filter((k) => keys.includes(k));
    if (validKeys.length === 0) return null;

    return (
      <div className="space-y-1.5 pt-2">
        <span className="px-4 text-[10px] font-black text-indigo-900/70 uppercase tracking-widest block mb-1">
          {label}
        </span>
        {validKeys.map((k) => {
          const Icon = icons[k as keyof typeof icons];
          const href = k === 'dashboard' ? '/dashboard' : `/${k}`;
          const isActive = path === href || ((k === 'projects' || k === 'departments') && path.startsWith(`/${k}/`));

          return (
            <Link
              key={k}
              href={href}
              onClick={() => setOpen(false)}
              className={`group flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white nav-item-active-glow translate-x-1'
                  : 'text-slate-700 hover:bg-white/80 hover:text-indigo-600 hover:translate-x-1 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50/80 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="tracking-tight">{t(`nav.${k}`)}</span>
              </div>

              {isActive ? (
                <ChevronRight size={16} className="opacity-90 animate-pulse text-white relative z-10" />
              ) : (
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  const nav = (
    <div className="flex flex-col h-full justify-between">
      {/* Sidebar Header Brand Area */}
      <div className="p-6 border-b border-white/50 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white p-3.5 rounded-2xl shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/15 float-3d header-brand-glow">
              <Building2 size={24} />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl text-slate-900 tracking-tight title-gradient leading-none">
                {t('app.shortName')}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase">
                v2.6
              </span>
            </div>
            <span className="text-[10px] font-black text-indigo-600/90 uppercase tracking-widest block mt-1">
              Enterprise Hub
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Categorized Menu Navigation */}
      <nav className="px-3 py-4 flex-1 space-y-4 overflow-y-auto custom-scrollbar">
        {renderNavGroup(coreGroup, 'Core Workspace')}
        {renderNavGroup(orgGroup, 'Organization & Team')}
        {renderNavGroup(systemGroup, 'System & Settings')}
      </nav>

      {/* Sidebar Bottom Cloud Metrics & Logout */}
      <div className="p-4 border-t border-white/50 space-y-3 bg-white/20 backdrop-blur-md">
        

        {/* Logout Button */}
        <button
          onClick={() => void logout()}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 font-bold text-sm text-rose-600 hover:text-white bg-rose-50/80 hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-600 rounded-2xl transition-all duration-300 shadow-xs border border-rose-200/80 hover:border-transparent hover:shadow-lg hover:shadow-rose-500/25 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative flex">
      {/* Dynamic Animated Background & Flying Dragon */}
      <div className="animated-bg"></div>
      <FlyingDragon />

      {/* Desktop Floating Animated Glass Sidebar */}
      <aside className="desktop-sidebar sidebar-animated-border fixed top-6 bottom-6 left-6 w-[275px] rounded-[2.2rem] flex flex-col z-20 overflow-hidden">
        {nav}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 transition-opacity flex" onClick={() => setOpen(false)}>
          <aside className="w-80 h-full sidebar-animated-border rounded-r-3xl flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 pt-6 bg-white/40">
              <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">Navigation</span>
              <button className="p-2 text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white rounded-xl transition-all border border-slate-200/50 shadow-xs" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      {/* Main Content Container */}
      <div className="flex-1 md:ml-[305px] flex flex-col min-h-screen w-full px-4 md:pr-6 md:py-6">

        {/* ULTRA HIGH-END ANIMATED HEADER WITH DYNAMIC VFX */}
        <header className="header-animated-border h-20 rounded-full flex items-center justify-between px-6 md:px-8 z-30 w-full mb-6 mt-4 md:mt-0 transition-all shadow-2xl relative">
          
          {/* Header Left: Mobile Button + Brand Emblem & Status */}
          <div className="flex items-center gap-4">
            <button
              className="mobile-only p-2.5 rounded-xl text-slate-700 bg-white/80 hover:bg-white hover:text-indigo-600 transition-all shadow-sm border border-slate-200/60"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>

            {/* Glowing Brand Badge */}
            <div className="flex items-center gap-3.5 group cursor-pointer">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-fuchsia-600 text-white font-black flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-white/90 group-hover:scale-105 transition-transform duration-300 header-brand-glow">
                  <Building2 size={24} className="group-hover:rotate-6 transition-transform" />
                </div>
              </div>

              <div>
                <h2 className="font-black text-slate-900 text-base md:text-lg leading-tight tracking-tight title-gradient">
                  {companyName}
                </h2>
              </div>
            </div>
          </div>

          {/* Header Right: Notifications, Language & User Capsule */}
          <div className="flex items-center gap-3.5">
            {/* Current Time Display */}
            {currentTime && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 border border-slate-200/80 text-slate-700 text-[11px] font-black tracking-wide shadow-xs">
                <Clock size={14} className="text-indigo-500" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* Notification Bell with Ping Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-600 transition-all border border-slate-200/80 shadow-xs hover:shadow-md hover:scale-105 relative group"
                title="Notifications"
              >
                <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white">
                  <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping"></span>
                </span>
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 p-4 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500" /> Notifications
                    </span>
                    <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 hover:bg-indigo-50 transition-colors cursor-pointer">
                      <p className="font-bold text-slate-800">🚀 Q3 Financial Target Reached</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Revenue growth exceeded +342% forecast</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors cursor-pointer">
                      <p className="font-bold text-slate-800">🛡️ System Security Audit Passed</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">ISO 27001 Compliance re-certified</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher Button */}
            <button
              className="btn bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-600 text-xs rounded-full px-3.5 py-2 shadow-xs border border-slate-200/80 hover:border-indigo-300 flex items-center gap-1.5 transition-all group"
              onClick={() => router.replace(path, { locale: locale === 'vi' ? 'en' : 'vi' })}
              title="Switch language"
            >
              <Languages size={16} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
              <span className="font-black tracking-wide text-xs">{locale === 'vi' ? 'EN' : 'VI'}</span>
            </button>

            {/* User Profile Capsule */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80">
              <div className="relative cursor-pointer group">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 text-white font-black text-xs md:text-sm flex items-center justify-center shadow-lg shadow-purple-500/25 ring-2 ring-white/90 group-hover:scale-105 transition-transform avatar-ring-glow">
                  {userInitials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="hidden sm:block">
                <p className="font-black text-slate-900 leading-tight text-xs md:text-sm">{userName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-slate-500 font-bold">
                    {user.employee?.department?.name || ''}
                  </span>
                  {user.employee?.department?.name && <span className="text-slate-300 px-1">•</span>}
                  <span className="text-[10px] text-slate-500 font-bold">
                    {user.employee?.position?.name || t(`roles.${user.role}`)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full animate-in fade-in duration-500">
          <div className="h-full rounded-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
