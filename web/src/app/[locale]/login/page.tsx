'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Languages,
  Lock,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/features/auth/auth-context';
import { usePathname, useRouter } from '@/i18n/navigation';
import Image from 'next/image';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const t = useTranslations();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const path = usePathname();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const submit = async (v: Form) => {
    try {
      setError('');
      await login(v.email, v.password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    }
  };

  return (
    <main className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* LEFT SECTION: Animated Background (Cols 1-7 on lg) */}
      <section className="hidden lg:flex w-[55%] relative overflow-hidden bg-slate-950">
        {/* The looping animated background image using CSS keyframes for a slow pan/zoom */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-[url('/images/enterprise_login_bg.png')] bg-cover bg-center"
            style={{ 
              animation: 'pan-image 30s linear infinite alternate'
            }}
          />
          {/* Overlay to ensure text readability if needed */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent"></div>
        </div>

        {/* Enterprise Branding Overlay */}
        <div className="relative z-10 p-12 flex flex-col justify-between h-full w-full">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight text-white drop-shadow-md">{t('app.name')}</h1>
              <p className="text-xs font-bold tracking-widest text-indigo-300 uppercase drop-shadow-sm">Enterprise Workspace</p>
            </div>
          </div>

          <div className="mb-12 max-w-lg">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              Secure Corporate Access
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-lg">
              Empower your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">workforce</span> today.
            </h2>
            <p className="text-slate-300 text-lg font-medium leading-relaxed drop-shadow-md">
              Access the centralized hub for company operations, performance tracking, and team collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT SECTION: Login Form */}
      <section className="w-full lg:w-[45%] flex flex-col relative bg-white shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.1)] z-10">
        
        {/* Header / Language Switcher */}
        <div className="p-6 flex justify-end">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-full transition-colors border border-slate-200"
            onClick={() => router.replace(path, { locale: locale === 'vi' ? 'en' : 'vi' })}
          >
            <Languages size={16} />
            <span>{locale === 'vi' ? 'English' : 'Tiếng Việt'}</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 max-w-2xl mx-auto w-full">
          
          <div className="mb-10 text-center lg:text-left">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 border border-indigo-100 shadow-sm">
              <ShieldCheck size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {t('auth.login')}
            </h2>
            <p className="text-slate-500 font-medium">{t('auth.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('fields.email')}</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  placeholder="name@company.com"
                  autoComplete="email"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">{t('validation.email')}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-slate-700">{t('fields.password')}</label>
                {/* Optional Forgot Password Link */}
                <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  className="w-full h-12 pl-11 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">{t('validation.min8')}</p>}
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-bold shadow-sm">
                {error}
              </div>
            )}

            <button
              className="w-full h-12 flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/25 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.login')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-auto pt-12 pb-6 text-center lg:text-left text-xs font-medium text-slate-400">
            &copy; 2026 {t('app.name')}. All rights reserved.<br/>
            Enterprise-grade secure connection.
          </div>
        </div>

      </section>

      {/* Global Style for Pan Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pan-image {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.15) translate(-2%, 2%); }
          100% { transform: scale(1.05) translate(2%, -2%); }
        }
      `}} />
    </main>
  );
}
