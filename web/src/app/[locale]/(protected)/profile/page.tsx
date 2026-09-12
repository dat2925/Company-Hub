'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, KeyRound, Lock, Mail, Shield, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema)
  });

  const newPasswordVal = watch('newPassword', '');

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
    <section className="space-y-8 perspective-2000 py-4">
      {/* Header */}
      <div className="stagger-item delay-100 relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-black uppercase tracking-widest mb-3 border border-purple-200/50 shadow-xs float-3d">
          <Sparkles size={14} />
          {t('profile.title')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight title-gradient">
          Manage Account Profile
        </h1>
        <p className="text-slate-500 font-medium mt-2 max-w-xl">
          View your corporate credentials, assigned role permissions, and security parameters.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 perspective-2000">
        {/* User Info Card */}
        <article className="stagger-item delay-200 card p-8 sm:p-10 bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/90 rounded-[2.5rem] flex flex-col justify-between glow-card hover-extreme-3d">
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-100">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white font-black text-3xl flex items-center justify-center shadow-xl shadow-purple-500/30 ring-4 ring-white float-3d shrink-0">
                {initials}
              </div>
              <div>
                <h2 className="font-black text-2xl text-slate-900 drop-shadow-xs">{userName}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full font-black uppercase tracking-widest border border-indigo-200/60 shadow-xs">
                    <UserCheck size={13} className="opacity-80" />
                    {user ? t(`roles.${user.role}`) : ''}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-black uppercase tracking-widest border border-emerald-200/60 shadow-xs">
                    <CheckCircle2 size={13} className="opacity-80" />
                    Verified User
                  </span>
                </div>
              </div>
            </div>

            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" />
              {t('profile.information')}
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/70 flex items-center justify-between shadow-xs hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Mail size={18} /></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('fields.email')}</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{user?.email}</span>
              </div>

              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/70 flex items-center justify-between shadow-xs hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Shield size={18} /></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('fields.role')}</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{user && t(`roles.${user.role}`)}</span>
              </div>

              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/70 flex items-center justify-between shadow-xs hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-fuchsia-50 text-fuchsia-600 rounded-xl"><Building2 size={18} /></div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('fields.company')}</span>
                </div>
                <span className="font-bold text-slate-800 text-sm">{user?.company?.name ?? 'Platform Administrator'}</span>
              </div>
            </div>
          </div>
        </article>

        {/* Change Password Card */}
        <form className="stagger-item delay-300 card p-8 sm:p-10 bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/90 rounded-[2.5rem] glow-card hover-extreme-3d flex flex-col relative" onSubmit={handleSubmit(submit)}>
          <h2 className="font-black text-2xl text-slate-900 mb-8 flex items-center gap-3 relative z-10 title-gradient w-fit">
            <KeyRound size={24} className="text-purple-600" />
            {t('profile.changePassword')}
          </h2>

          <div className="space-y-6 flex-1 relative z-10">
            <div>
              <label className="label">{t('fields.currentPassword')}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="password" 
                  className="input pl-11 bg-white/90 border-slate-200 font-semibold" 
                  placeholder="••••••••" 
                  {...register('currentPassword')} 
                />
              </div>
              {errors.currentPassword && <p className="error">{t('validation.min8')}</p>}
            </div>

            <div>
              <label className="label">{t('fields.newPassword')}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="password" 
                  className="input pl-11 bg-white/90 border-slate-200 font-semibold" 
                  placeholder="••••••••" 
                  {...register('newPassword')} 
                />
              </div>
              {errors.newPassword && <p className="error">{t('validation.min8')}</p>}

              {/* Password strength visual indicator */}
              {newPasswordVal && (
                <div className="mt-3 space-y-1">
                  <div className="flex h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${newPasswordVal.length < 8 ? 'w-1/3 bg-rose-500' : newPasswordVal.length < 12 ? 'w-2/3 bg-amber-500' : 'w-full bg-emerald-500'}`}></div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400">
                    Strength: {newPasswordVal.length < 8 ? 'Too Short' : newPasswordVal.length < 12 ? 'Medium' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 mt-auto">
              <button 
                className="btn btn-primary w-full py-4 text-base font-black shadow-xl shadow-purple-500/30 rounded-2xl" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {t('common.loading')}
                  </span>
                ) : (
                  t('common.actions.save')
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
