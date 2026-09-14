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
  Target,
  UserRound,
  Users,
  X,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Trophy,
  Gamepad2,
  MessageCircle
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { FlyingDragon } from '@/components/flying-dragon';
import { WeatherWidget } from '@/components/weather-widget';
import { MiniGameWidget } from '@/components/mini-game-widget';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

const icons = {
  dashboard: Gauge,
  chat: MessageCircle,
  companies: Building2,
  departments: Network,
  employees: Users,
  shifts: CalendarDays,
  attendance: CalendarCheck,
  payrolls: Banknote,
  meetings: CalendarDays,
  projects: FolderKanban,
  bulletins: Newspaper,
  notifications: Bell,
  talent: Target,
  profile: UserRound,
  impact: Trophy,
  arcade: Gamepad2
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const t = useTranslations();
  const path = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDragon, setShowDragon] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRelaxation, setShowRelaxation] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const notificationsQuery = useQuery({
    queryKey: ['header-notifications'],
    queryFn: () => api.get<{ id: string; title: string; message: string; createdAt: string }[]>('/notifications?page=1&pageSize=5'),
    enabled: !!user
  });

  const notificationsList = notificationsQuery.data?.data || [];
  const unreadCount = notificationsList.length;

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
      ? ['dashboard', 'chat', 'departments', 'employees', 'shifts', 'attendance', 'payrolls', 'meetings', 'projects', 'bulletins', 'notifications', 'talent', 'impact', 'arcade', 'profile']
      : ['dashboard', 'chat', ...(canManageDepartment ? ['departments'] : []), 'shifts', 'attendance', 'payrolls', 'meetings', 'projects', 'bulletins', 'notifications', 'talent', 'impact', 'arcade', 'profile'];

  const userName = user.employee?.fullName ?? user.email;
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : 'U';
  const companyName = user.company?.name ?? t('app.name');

  // Categorized Navigation Groups
  const coreGroup = ['dashboard', 'chat', 'shifts', 'attendance', 'payrolls', 'projects', 'meetings'];
  const orgGroup = ['departments', 'employees', 'talent', 'impact', 'arcade', 'bulletins'];
  const systemGroup = ['companies', 'notifications', 'profile'];

  const renderNavGroup = (groupKeys: string[], label: string) => {
    const validKeys = groupKeys.filter((k) => keys.includes(k));
    if (validKeys.length === 0) return null;

    return (
      <div className="space-y-1 pt-1">
        {!isCollapsed && (
          <span className="px-3 text-[9px] font-black text-indigo-900/70 uppercase tracking-widest block mb-1">
            {label}
          </span>
        )}
        {validKeys.map((k) => {
          const Icon = icons[k as keyof typeof icons];
          const href = k === 'dashboard' ? '/dashboard' : `/${k}`;
          const isActive = path === href || ((k === 'projects' || k === 'departments') && path.startsWith(`/${k}/`));

          return (
            <Link
              key={k}
              href={href}
              onClick={() => setOpen(false)}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl font-bold text-sm transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white nav-item-active-glow translate-x-1'
                  : 'text-slate-700 hover:bg-white/80 hover:text-indigo-600 hover:translate-x-1 hover:shadow-sm'
              }`}
              title={isCollapsed ? t(`nav.${k}`) : undefined}
            >
              <div className={`flex items-center gap-3 relative z-10 ${isCollapsed ? 'mx-auto' : ''}`}>
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-50/80 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                </div>
                {!isCollapsed && <span className="tracking-tight text-[13px]">{t(`nav.${k}`)}</span>}
              </div>

              {!isCollapsed && (
                isActive ? (
                  <ChevronRight size={14} className="opacity-90 animate-pulse text-white relative z-10" />
                ) : (
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                )
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
      <div className={`p-4 border-b border-white/50 bg-white/30 backdrop-blur-md flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-2.5'}`}>
          <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/15 float-3d header-brand-glow">
              <Building2 size={20} />
            </div>
            {isCollapsed && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
              </span>
            )}
          </div>
          {!isCollapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg text-slate-900 tracking-tight title-gradient leading-none">
                  {t('app.shortName')}
                </span>
                <span className="px-1 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase">
                  v2.6
                </span>
              </div>
              <span className="text-[9px] font-black text-indigo-600/90 uppercase tracking-widest block mt-0.5">
                Enterprise Hub
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Categorized Menu Navigation */}
      <nav className="px-2 py-3 flex-1 space-y-3 overflow-y-auto custom-scrollbar">
        {renderNavGroup(coreGroup, 'Core Workspace')}
        {renderNavGroup(orgGroup, 'Organization & Team')}
        {renderNavGroup(systemGroup, 'System & Settings')}
      </nav>

      {/* Sidebar Bottom Cloud Metrics & Logout */}
      <div className="p-3 border-t border-white/50 bg-white/20 backdrop-blur-md">
        {/* Logout Button */}
        <button
          onClick={() => void logout()}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-center gap-2'} py-2 font-bold text-[13px] text-rose-600 hover:text-white bg-rose-50/80 hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-600 rounded-xl transition-all duration-300 shadow-xs border border-rose-200/80 hover:border-transparent hover:shadow-md hover:shadow-rose-500/25 group`}
          title={isCollapsed ? t('nav.logout') : undefined}
        >
          <LogOut size={16} className={`${isCollapsed ? '' : 'group-hover:-translate-x-1'} transition-transform`} />
          {!isCollapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative flex bg-slate-50">
      {/* Dynamic Animated Background & Flying Dragon */}
      <div className="animated-bg opacity-50"></div>
      {showDragon && <FlyingDragon />}

      {/* Desktop Floating Animated Glass Sidebar */}
      <aside className={`hidden md:flex desktop-sidebar sidebar-animated-border fixed top-3 bottom-3 left-3 ${isCollapsed ? 'w-[72px]' : 'w-[240px]'} rounded-2xl flex-col z-20 overflow-hidden transition-all duration-300 ease-in-out bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg`}>
        {nav}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity flex md:hidden" onClick={() => setOpen(false)}>
          <aside className="w-72 h-full sidebar-animated-border bg-white rounded-r-2xl flex flex-col shadow-2xl animate-in slide-in-from-left duration-300 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-4 pt-4 pb-2 bg-white/40">
              <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Navigation</span>
              <button className="p-1.5 text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white rounded-lg transition-all border border-slate-200/50 shadow-xs" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      {/* Main Content Container */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-[88px]' : 'md:ml-[256px]'} flex flex-col min-h-screen w-full px-3 md:pr-4 md:py-3`}>

        {/* ULTRA HIGH-END ANIMATED HEADER WITH DYNAMIC VFX */}
        <header className="header-animated-border h-14 md:h-16 rounded-2xl flex items-center justify-between px-4 z-30 w-full mb-4 mt-3 md:mt-0 transition-all shadow-sm relative bg-white/70 backdrop-blur-lg border border-white/60">
          
          {/* Header Left: Mobile Button + Brand Emblem & Status */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg text-slate-700 bg-white/80 hover:bg-white hover:text-indigo-600 transition-all shadow-sm border border-slate-200/60"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>

            <button
              className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>

            {/* Title / Brand */}
            <div className="flex items-center gap-2 group cursor-pointer ml-1">
              <div>
                <h2 className="font-bold text-slate-800 text-sm md:text-base leading-tight tracking-tight">
                  {companyName}
                </h2>
              </div>
            </div>
          </div>

          {/* Header Right: Notifications, Language & User Capsule */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Toggle Dragon Button */}
            <button
              onClick={() => setShowDragon(!showDragon)}
              className={`p-2 rounded-lg transition-all border shadow-xs relative group ${
                showDragon
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200/80 hover:bg-white hover:text-slate-600'
                  : 'bg-white/80 text-slate-600 border-slate-200/80 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              title="Toggle Dragon Animation"
            >
              <Sparkles size={16} className={`transition-transform ${showDragon ? 'animate-pulse' : 'group-hover:rotate-12'}`} />
            </button>

            {/* Current Time Display */}
            {currentTime && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 border border-slate-200/80 text-slate-700 text-[10px] font-bold tracking-wide shadow-xs">
                <Clock size={12} className="text-indigo-500" />
                <span>{currentTime}</span>
              </div>
            )}

            {/* Weather Widget */}
            <WeatherWidget />

            {/* Relaxation Toggle */}
            <button
              onClick={() => setShowRelaxation(true)}
              className="p-2 rounded-lg bg-white/80 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all border border-slate-200/80 shadow-xs relative group"
              title="Phút thư giãn"
            >
              <Gamepad2 size={16} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Notification Bell with Ping Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-white/80 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all border border-slate-200/80 shadow-xs relative group"
                title="Notifications"
              >
                <Bell size={16} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white">
                  <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping"></span>
                </span>
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap size={12} className="text-amber-500" /> Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">{unreadCount} New</span>
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {notificationsList.length > 0 ? (
                      notificationsList.map(n => (
                        <Link href="/notifications" key={n.id} onClick={() => setShowNotifications(false)}>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/80 hover:border-indigo-100 transition-colors cursor-pointer mb-1.5">
                            <p className="font-semibold text-slate-800 text-[11px] line-clamp-1">{n.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 font-medium">
                        {t('common.empty')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher Button */}
            <button
              className="bg-white/80 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 text-[11px] rounded-lg px-2.5 py-1.5 shadow-xs border border-slate-200/80 flex items-center gap-1 transition-all group"
              onClick={() => router.replace(path, { locale: locale === 'vi' ? 'en' : 'vi' })}
              title="Switch language"
            >
              <Languages size={14} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
              <span className="font-bold tracking-wide">{locale === 'vi' ? 'EN' : 'VI'}</span>
            </button>

            {/* User Profile Capsule */}
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200/80">
              <div className="relative cursor-pointer group">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-purple-500/20 ring-2 ring-white/90 group-hover:scale-105 transition-transform avatar-ring-glow">
                  {userInitials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="hidden sm:block">
                <p className="font-bold text-slate-800 leading-tight text-[12px]">{userName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-slate-500 font-medium">
                    {user.employee?.department?.name || ''}
                  </span>
                  {user.employee?.department?.name && <span className="text-slate-300 px-0.5">•</span>}
                  <span className="text-[9px] text-slate-500 font-medium">
                    {user.employee?.position?.name || t(`roles.${user.role}`)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full animate-in fade-in duration-500 flex flex-col">
          <div className="flex-1 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden p-0">
            {children}
          </div>
        </main>
      </div>

      <MiniGameWidget isOpen={showRelaxation} onClose={() => setShowRelaxation(false)} />
    </div>
  );
}

