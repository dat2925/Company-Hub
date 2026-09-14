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
  LineChart,
  MessageSquare,
  CalendarDays,
  SkipForward,
  Building2,
  GraduationCap,
  BriefcaseBusiness,
  Users
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

// --- EXTENDED CINEMATIC INTRO COMPONENT ---
function CinematicIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    // Check if user has already seen intro this session
    const hasSeenIntro = sessionStorage.getItem('soloTechIntroSeen');
    if (hasSeenIntro) {
      setSkipped(true);
      onComplete();
      return;
    }

    // Extended Sequence Timeline (14 seconds total)
    const t1 = setTimeout(() => setPhase(1), 3500); // 3.5s: Ecosystem (EduNest & CorpAll)
    const t2 = setTimeout(() => setPhase(2), 7500); // 7.5s: Zoom into CorpAll + Features Burst
    const t3 = setTimeout(() => setPhase(3), 10500); // 10.5s: Growth Chart
    const t4 = setTimeout(() => {
      setPhase(4); // 13.5s: Fade out overlay
      sessionStorage.setItem('soloTechIntroSeen', 'true');
      setTimeout(onComplete, 1000); // Allow fade out to finish
    }, 13500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setSkipped(true);
    sessionStorage.setItem('soloTechIntroSeen', 'true');
    onComplete();
  };

  if (skipped) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#030305] transition-opacity duration-1000 ease-in-out overflow-hidden ${phase >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Skip Button */}
      <button 
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white backdrop-blur-md transition-all text-xs font-bold tracking-widest border border-white/10"
      >
        SKIP INTRO <SkipForward size={14} />
      </button>

      {/* PHASE 0: SOLO Tech Origins (0s - 3.5s) */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${phase === 0 ? 'opacity-100 scale-100' : phase >= 1 ? 'opacity-0 scale-75 blur-md -translate-y-20' : 'opacity-0'}`}>
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full blur-3xl opacity-40 animate-pulse-slow"></div>
          <h1 className="relative text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 tracking-tighter drop-shadow-2xl mb-4 text-center">
            SOLO Tech
          </h1>
        </div>
        <div className="flex flex-col items-center gap-2 mt-4 animate-fade-in-down animation-delay-1000">
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
          <p className="text-lg md:text-2xl font-medium text-blue-200/80 tracking-widest uppercase">
            Thành lập năm 2026
          </p>
          <p className="text-sm md:text-lg font-bold text-indigo-400/90 tracking-widest flex items-center gap-2">
            <Globe size={16} /> TẠI HÀ NỘI
          </p>
          <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent mt-2"></div>
        </div>
      </div>

      {/* PHASE 1: The Ecosystem - EduNest & CorpAll (3.5s - 7.5s) */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1500 ease-in-out ${phase === 1 ? 'opacity-100 scale-100' : phase > 1 ? 'opacity-0 scale-150 blur-xl' : 'opacity-0 scale-50 translate-y-20'}`}>
        
        <h2 className="absolute top-20 text-2xl font-black text-white/50 tracking-widest uppercase animate-pulse-slow">
          Hệ Sinh Thái Sản Phẩm
        </h2>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center w-full max-w-6xl px-8">
          {/* EduNest Card */}
          <div className="w-full md:w-1/2 max-w-md p-8 rounded-3xl bg-amber-500/10 border border-amber-400/30 backdrop-blur-xl flex flex-col items-center text-center gap-6 shadow-[0_0_50px_rgba(245,158,11,0.15)] animate-float">
            <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-400/50">
              <GraduationCap size={40} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-amber-100 mb-2 tracking-tight">EduNest</h3>
              <p className="text-amber-200/70 font-medium uppercase tracking-widest text-sm">Quản Lý Giáo Dục</p>
            </div>
          </div>

          {/* CorpAll Card */}
          <div className="w-full md:w-1/2 max-w-md p-8 rounded-3xl bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-xl flex flex-col items-center text-center gap-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-float animation-delay-1000">
            <div className="w-20 h-20 bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-400/50">
              <BriefcaseBusiness size={40} className="text-cyan-400" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-cyan-100 mb-2 tracking-tight">CorpAll</h3>
              <p className="text-cyan-200/70 font-medium uppercase tracking-widest text-sm">Quản Lý Doanh Nghiệp</p>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 2: Zoom into CorpAll + Features Burst (7.5s - 10.5s) */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out ${phase === 2 ? 'opacity-100 scale-100' : phase > 2 ? 'opacity-0 scale-125 blur-xl' : 'opacity-0 scale-50'}`}>
        <div className="relative w-full max-w-4xl h-[500px]">
          
          {/* Central Hub (CorpAll representation) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-cyan-500/20 border border-cyan-400/50 rounded-[2rem] backdrop-blur-2xl flex flex-col items-center justify-center shadow-[0_0_100px_rgba(6,182,212,0.6)] animate-pulse-slow">
            <Zap size={48} className="text-cyan-300 mb-2" />
            <span className="text-white font-black tracking-widest">CorpAll</span>
          </div>
          
          {/* Exploding Feature Cards */}
          <div className={`absolute top-10 left-10 p-4 rounded-2xl bg-indigo-600/20 border border-indigo-400/30 backdrop-blur-md flex items-center gap-3 transition-all duration-1000 ${phase === 2 ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-[200px] translate-y-[200px] opacity-0'}`}>
            <MessageSquare className="text-indigo-300" /> <span className="text-white font-bold tracking-widest uppercase">Giao tiếp</span>
          </div>
          <div className={`absolute bottom-10 left-10 p-4 rounded-2xl bg-purple-600/20 border border-purple-400/30 backdrop-blur-md flex items-center gap-3 transition-all duration-1000 delay-100 ${phase === 2 ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-[200px] -translate-y-[200px] opacity-0'}`}>
            <Users className="text-purple-300" /> <span className="text-white font-bold tracking-widest uppercase">Nhân sự</span>
          </div>
          <div className={`absolute top-20 right-10 p-4 rounded-2xl bg-emerald-600/20 border border-emerald-400/30 backdrop-blur-md flex items-center gap-3 transition-all duration-1000 delay-200 ${phase === 2 ? 'translate-x-0 translate-y-0 opacity-100' : '-translate-x-[200px] translate-y-[200px] opacity-0'}`}>
            <LineChart className="text-emerald-300" /> <span className="text-white font-bold tracking-widest uppercase">Phân tích</span>
          </div>
          <div className={`absolute bottom-20 right-10 p-4 rounded-2xl bg-rose-600/20 border border-rose-400/30 backdrop-blur-md flex items-center gap-3 transition-all duration-1000 delay-300 ${phase === 2 ? 'translate-x-0 translate-y-0 opacity-100' : '-translate-x-[200px] -translate-y-[200px] opacity-0'}`}>
            <CalendarDays className="text-rose-300" /> <span className="text-white font-bold tracking-widest uppercase">Lên lịch</span>
          </div>
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 p-4 rounded-2xl bg-amber-600/20 border border-amber-400/30 backdrop-blur-md flex items-center gap-3 transition-all duration-1000 delay-500 ${phase === 2 ? 'translate-y-0 opacity-100' : 'translate-y-[200px] opacity-0'}`}>
            <Building2 className="text-amber-300" /> <span className="text-white font-bold tracking-widest uppercase">Vận hành</span>
          </div>
        </div>
      </div>

      {/* PHASE 3: Dramatic Growth (10.5s - 13.5s) */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative w-full max-w-5xl h-[500px]">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 500">
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path 
              d="M 50,450 Q 200,450 400,300 T 700,100 L 950,50" 
              fill="none" 
              stroke="url(#growthGrad)" 
              strokeWidth="16" 
              strokeLinecap="round"
              filter="url(#glow)"
              className={`transition-all duration-[2000ms] ease-out ${phase >= 3 ? 'growth-line-active' : 'growth-line-hidden'}`}
            />
          </svg>
        </div>
        <div className={`absolute bottom-32 transition-all duration-1000 delay-500 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 tracking-tighter drop-shadow-2xl">
            KẾT QUẢ: TĂNG TRƯỞNG
          </h1>
        </div>
      </div>
    </div>
  );
}


// --- MAIN LOGIN PAGE ---
export default function Login() {
  const t = useTranslations();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
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
    <>
      <CinematicIntro onComplete={() => setIntroFinished(true)} />

      <main className={`min-h-screen relative overflow-hidden bg-[#09090b] font-sans selection:bg-cyan-500/30 flex items-center justify-center p-4 transition-opacity duration-1000 ${introFinished ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* --- HIGHLY ANIMATED BACKGROUND ELEMENTS --- */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-[100%] opacity-40 mix-blend-screen bg-anim-gradient" />
        </div>

        <div className="absolute inset-0 z-0 bg-cyber-grid opacity-20 pointer-events-none perspective-1000">
          <div className="w-full h-full transform-style-3d rotate-x-60 animate-grid-flow origin-bottom" />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-indigo-600/30 rounded-full blur-[120px] animate-blob" />
          <div className="absolute top-[30%] right-[10%] w-[35vw] h-[35vw] bg-cyan-500/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-[10%] left-[40%] w-[45vw] h-[45vw] bg-purple-600/30 rounded-full blur-[140px] animate-blob animation-delay-4000" />
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={`rain-${i}`}
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
          
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 animate-slide-in-left">
            
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
            
            <div className="overflow-hidden">
              <h2 className="text-xl lg:text-2xl font-bold text-slate-300 leading-relaxed max-w-lg animate-text-reveal">
                Welcome to the future of enterprise management.
              </h2>
            </div>
            <p className="text-slate-400 font-medium max-w-md animate-fade-in animation-delay-1000">
              A centralized, high-performance command center for your entire workforce and operations.
            </p>
            
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

          <div className="w-full max-w-md lg:w-1/2 animate-slide-in-right">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-20 animate-pulse-slow"></div>
              
              <div className="relative p-8 sm:p-10 rounded-[2.5rem] bg-slate-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden group/form">
                
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                <div className="mb-8 text-center relative z-10">
                  <h3 className="text-2xl font-black text-white tracking-tight">{t('auth.login')}</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">{t('auth.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit(submit)} className="space-y-6 relative z-10">
                  
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
          /* Growth Line Animation */
          .growth-line-hidden {
            stroke-dasharray: 2000;
            stroke-dashoffset: 2000;
          }
          .growth-line-active {
            stroke-dasharray: 2000;
            stroke-dashoffset: 0;
          }

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
    </>
  );
}
