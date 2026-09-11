'use client';
import {Bell,BriefcaseBusiness,Building2,CalendarDays,FolderKanban,Gauge,Languages,ListChecks,LogOut,Menu,Network,Newspaper,UserRound,Users,X} from 'lucide-react';
import {useLocale,useTranslations} from 'next-intl';
import {useState} from 'react';
import {useAuth} from '@/features/auth/auth-context';
import {Link,usePathname,useRouter} from '@/i18n/navigation';

const icons={dashboard:Gauge,companies:Building2,departments:Network,positions:BriefcaseBusiness,employees:Users,meetings:CalendarDays,projects:FolderKanban,issues:ListChecks,bulletins:Newspaper,notifications:Bell,profile:UserRound};

export function AppShell({children}:{children:React.ReactNode}){
  const{user,loading,logout}=useAuth();const t=useTranslations();const path=usePathname();const locale=useLocale();const router=useRouter();const[open,setOpen]=useState(false);
  if(loading)return <div className="min-h-screen grid place-items-center">{t('common.loading')}</div>;if(!user)return null;
  const keys=user.role==='SUPER_ADMIN'?['dashboard','companies','profile']:user.role==='ADMIN'?['dashboard','departments','positions','employees','meetings','projects','issues','bulletins','notifications','profile']:['dashboard','meetings','projects','issues','bulletins','notifications','profile'];
  const nav=<><div className="p-5 flex items-center gap-3 font-bold text-lg"><span className="bg-blue-600 text-white p-2 rounded-lg"><Building2 size={20}/></span>{t('app.shortName')}</div><nav className="px-3 flex-1">{keys.map(k=>{const Icon=icons[k as keyof typeof icons];const href=k==='dashboard'?'/dashboard':`/${k}`;return <Link key={k} href={href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg ${path===href?'bg-blue-50 text-blue-700 font-semibold':'text-gray-600 hover:bg-gray-50'}`}><Icon size={19}/>{t(`nav.${k}`)}</Link>})}</nav><button onClick={()=>void logout()} className="m-3 flex items-center gap-3 px-3 py-2.5 text-red-600"><LogOut size={19}/>{t('nav.logout')}</button></>;
  return <div className="min-h-screen"><aside className="desktop-sidebar fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">{nav}</aside>{open&&<div className="fixed inset-0 bg-black/40 z-40" onClick={()=>setOpen(false)}><aside className="w-72 h-full bg-white flex flex-col" onClick={e=>e.stopPropagation()}><button className="self-end p-4" onClick={()=>setOpen(false)}><X/></button>{nav}</aside></div>}<div className="md:ml-64"><header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8"><button className="mobile-only" onClick={()=>setOpen(true)} aria-label="Menu"><Menu/></button><div><p className="font-semibold">{user.employee?.fullName??user.email}</p><p className="text-xs text-gray-500">{t(`roles.${user.role}`)}</p></div><button className="btn btn-secondary" onClick={()=>router.replace(path,{locale:locale==='vi'?'en':'vi'})}><Languages size={16}/>{locale==='vi'?'EN':'VI'}</button></header><main className="page-pad p-8">{children}</main></div></div>;
}
