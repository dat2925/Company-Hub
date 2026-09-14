'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Languages,
  Lock,
  Mail,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/features/auth/auth-context';
import { usePathname, useRouter } from '@/i18n/navigation';

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
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#09090b] font-sans selection:bg-cyan-500/30 flex items-center justify-center p-4">
      
      {/* --- HIGHLY ANIMATED BACKGROUND ELEMENTS --- */}
      
      {/* 1. Shifting Gradient Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[100%] opacity-40 mix-blend-screen bg-anim-gradient" />
      </div>

      {/* 2. Floating Cyber Grid */}
      <div className="absolute inset-0 z-0 bg-cyber-grid opacity-20 pointer-events-none perspective-1000">
        <div className="w-full h-full transform-style-3d rotate-x-60 animate-grid-flow origin-bottom" />
      </div>

      {/* 3. Pulsing Orbs & Floating Shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Orb 1 */}
        <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-indigo-600/30 rounded-full blur-[120px] animate-blob" />
        {/* Orb 2 */}
        <div className="absolute top-[30%] right-[10%] w-[35vw] h-[35vw] bg-cyan-500/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        {/* Orb 3 */}
        <div className="absolute -bottom-[10%] left-[40%] w-[45vw] h-[45vw] bg-purple-600/30 rounded-full blur-[140px] animate-blob animation-delay-4000" />
      </div>

      {/* 4. Falling Data Particles (CSS Only) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-[2px] h-[30px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-0 animate-data-rain"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* --- FOREGROUND INTERFACE --- */}

      {/* Top Navigation / Controls */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 animate-fade-in-down">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <Globe size={14} className="text-cyan-400 animate-spin-slow" />
          <span className="text-xs font-bold text-slate-300 tracking-wider">SECURE CONNECTION ESTABLISHED</span>
        </div>
        
        <button
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 rounded-full transition-all border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95 group"
          onClick={() => router.replace(path, { locale: locale === 'vi' ? 'en' : 'vi' })}
        >
          <Languages size={16} className="group-hover:rotate-12 transition-transform text-cyan-400" />
          <span>{locale === 'vi' ? 'English' : 'Tiếng Việt'}</span>
        </button>
      </div>

      {/* Main Glassmorphism Login Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between">
        
        {/* Left Side: Dynamic Corporate Branding */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 animate-slide-in-left">
          
          {/* Animated CorpAll Logo / Title */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-center lg:justify-start gap-4">
              <div className="w-16 h-16 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                <Zap size={32} className="text-cyan-300" />
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-indigo-200 tracking-tighter drop-shadow-lg">
                CorpAll
              </h1>
            </div>
          </div>
          
          {/* Animated Subtitle Tagline */}
          <div className="overflow-hidden">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-300 leading-relaxed max-w-lg animate-text-reveal">
              Welcome to the future of enterprise management.
            </h2>
          </div>
          <p className="text-slate-400 font-medium max-w-md animate-fade-in animation-delay-1000">
            A centralized, high-performance command center for your entire workforce and operations.
          </p>
          
          {/* Live Status Indicators */}
          <div className="flex gap-4 pt-4 animate-fade-in animation-delay-1500">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase text-slate-500">System Status</span>
              <span className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Operational
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-black uppercase text-slate-500">Encryption</span>
              <span className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <ShieldCheck size={14} />
                AES-256
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: The Glass Form */}
        <div className="w-full max-w-md lg:w-1/2 animate-slide-in-right">
          <div className="relative">
            {/* Form Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-20 animate-pulse-slow"></div>
            
            <div className="relative p-8 sm:p-10 rounded-[2.5rem] bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden group/form">
              
              {/* Form Inner Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

              <div className="mb-8 text-center relative z-10">
                <h3 className="text-2xl font-black text-white tracking-tight">{t('auth.login')}</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">{t('auth.subtitle')}</p>
              </div>

              <form onSubmit={handleSubmit(submit)} className="space-y-6 relative z-10">
                
                {/* Email Field */}
                <div className="group/input">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within/input:text-cyan-400 transition-colors">
                    {t('fields.email')}
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                    <input
                      className="w-full h-12 pl-12 pr-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 focus:bg-black/60 transition-all font-medium"
                      placeholder="name@corpall.com"
                      autoComplete="email"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-rose-400 text-xs mt-1.5 font-bold animate-shake">{t('validation.email')}</p>}
                </div>

                {/* Password Field */}
                <div className="group/input">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider group-focus-within/input:text-cyan-400 transition-colors">
                      {t('fields.password')}
                    </label>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                    <input
                      className="w-full h-12 pl-12 pr-12 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 focus:bg-black/60 transition-all font-medium"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-400 text-xs mt-1.5 font-bold animate-shake">{t('validation.min8')}</p>}
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold shadow-sm animate-shake backdrop-blur-md">
                    {error}
                  </div>
                )}

                <button
                  className="w-full h-14 relative flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl font-black transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden group/btn"
                  disabled={isSubmitting}
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover/btn:animate-shimmer skew-x-12"></div>
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <>
                      <span className="tracking-widest uppercase">{t('auth.login')}</span>
                      <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Global Style for Keyframe Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Background Animations */
        @keyframes anim-gradient {
          0% { background: radial-gradient(circle at 0% 50%, rgba(6,182,212,0.4), rgba(79,70,229,0.2), transparent 50%); }
          50% { background: radial-gradient(circle at 100% 50%, rgba(147,51,234,0.3), rgba(6,182,212,0.2), transparent 50%); }
          100% { background: radial-gradient(circle at 0% 50%, rgba(6,182,212,0.4), rgba(79,70,229,0.2), transparent 50%); }
        }
        .bg-anim-gradient {
          width: 200%;
          height: 200%;
          animation: anim-gradient 15s ease-in-out infinite;
        }

        /* Floating Blobs */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* 3D Grid Floor */
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-x-60 {
          transform: rotateX(60deg) scale(2);
        }
        .bg-cyber-grid {
          background-image: 
            linear-gradient(to right, rgba(6,182,212,0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6,182,212,0.2) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        @keyframes grid-flow {
          0% { background-position: 0 0; }
          100% { background-position: 0 50px; }
        }
        .animate-grid-flow {
          animation: grid-flow 2s linear infinite;
        }

        /* Data Rain */
        @keyframes data-rain {
          0% { transform: translateY(-100vh); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-data-rain {
          animation-name: data-rain;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        /* Entrance Animations */
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes text-reveal {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-text-reveal {
          animation: text-reveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards;
          opacity: 0;
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        /* Floating Element */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* Button Shimmer */
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1s ease-in-out;
        }

        /* Error Shake */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        /* Slow Pulse */
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Utilities */
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-2000 { animation-delay: 2000ms; }
        .animation-delay-4000 { animation-delay: 4000ms; }
      `}} />
    </main>
  );
}
