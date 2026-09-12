'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, KeyRound, Lock, Mail, Shield, UserCheck, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuth } from '@/features/auth/auth-context';
import { api } from '@/lib/api/client';

const schema = z.object({ currentPassword: z.string().min(8), newPassword: z.string().min(8) });
type Form = z.infer<typeof schema>;

export default function Profile() {
  const t = useTranslations();
  const { user, logout } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema)
  });

  const submit = async (v: Form) => {
    try {
      await api.post('/auth/change-password', v);
      toast.success(t('toast.passwordChanged'));
      reset();
      await logout();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const userName = user?.employee?.fullName ?? user?.email ?? '';
  const initials = userName ? userName.substring(0, 2).toUpperCase() : 'U';

  return (
    <section className="space-y-10 perspective-2000 py-6">
      <div className="stagger-item delay-100 relative">
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-black uppercase tracking-widest mb-3 border border-purple-200/50 shadow-sm float-3d">
          <Sparkles size={14} />
          {t('profile.title')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight title-gradient">
          Manage Profile
        </h1>
        <p className="text-slate-500 font-medium mt-2">Manage your account information and security settings in 3D space.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 perspective-2000">
        {/* User Info 3D Card */}
        <article className="stagger-item delay-200 card p-8 bg-white/70 backdrop-blur-2xl shadow-xl border border-white/80 rounded-[2rem] flex flex-col justify-between glow-card transform-3d hover-extreme-3d">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-200/60">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 text-white font-black text-3xl flex items-center justify-center shadow-2xl shadow-purple-500/40 ring-4 ring-white/50 float-3d">
                {initials}
              </div>
              <div>
                <h2 className="font-black text-2xl text-slate-900 drop-shadow-sm">{userName}</h2>
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-indigo-100/80 text-indigo-700 text-[10px] rounded-full font-black uppercase tracking-widest border border-indigo-200/60 shadow-sm">
                  <UserCheck size={14} className="opacity-70" />
                  {user ? t(`roles.${user.role}`) : ''}
                </span>
              </div>
            </div>

            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <Shield size={16} className="text-indigo-400" />
              {t('profile.information')}
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-white/60 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><Mail size={18} /></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('fields.email')}</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{user?.email}</span>
              </div>

              <div className="p-4 bg-white/60 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><Shield size={18} /></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('fields.role')}</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{user && t(`roles.${user.role}`)}</span>
              </div>

              <div className="p-4 bg-white/60 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-fuchsia-50 text-fuchsia-500 rounded-lg"><Building2 size={18} /></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('fields.company')}</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{user?.company?.name ?? '—'}</span>
              </div>
            </div>
          </div>
        </article>

        {/* Change Password 3D Card */}
        <form className="stagger-item delay-300 card p-8 bg-white/70 backdrop-blur-2xl shadow-xl border border-white/80 rounded-[2rem] glow-card transform-3d hover-extreme-3d flex flex-col relative" onSubmit={handleSubmit(submit)}>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-fuchsia-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

          <h2 className="font-black text-2xl text-slate-900 mb-8 flex items-center gap-3 relative z-10 title-gradient w-fit">
            <KeyRound size={24} className="text-purple-600" />
            {t('profile.changePassword')}
          </h2>

          <div className="space-y-6 flex-1 relative z-10">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('fields.currentPassword')}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                <input type="password" className="input pl-12 bg-white/80 border-slate-200 py-3.5 text-base font-semibold shadow-inner focus:bg-white focus:ring-4 focus:ring-purple-500/20" placeholder="••••••••" {...register('currentPassword')} />
              </div>
              {errors.currentPassword && <p className="error mt-2">{t('validation.min8')}</p>}
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('fields.newPassword')}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                <input type="password" className="input pl-12 bg-white/80 border-slate-200 py-3.5 text-base font-semibold shadow-inner focus:bg-white focus:ring-4 focus:ring-purple-500/20" placeholder="••••••••" {...register('newPassword')} />
              </div>
              {errors.newPassword && <p className="error mt-2">{t('validation.min8')}</p>}
            </div>

            <div className="pt-6 mt-auto">
              <button className="btn btn-primary w-full py-4 text-lg font-black shadow-xl shadow-purple-500/30 rounded-2xl hover:scale-[1.02] transition-transform" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading') : t('common.actions.save')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
