'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Eye,
  EyeOff,
  Globe,
  Languages,
  Lock,
  Mail,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/features/auth/auth-context';
import { usePathname, useRouter } from '@/i18n/navigation';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
type Form = z.infer<typeof schema>;

const SCENES = [
  {
    id: 'financial',
    title: 'Financial Exponential Growth',
    subtitle: 'ARR skyrocketed by +342% in Q3',
    badge: 'Revenue Acceleration'
  },
  {
    id: 'network',
    title: 'Global Enterprise Reach',
    subtitle: '1.2M+ Active Users across 45+ Countries',
    badge: 'Worldwide Expansion'
  },
  {
    id: 'ai',
    title: 'AI Automation & Speed',
    subtitle: '+68% operational efficiency gain',
    badge: 'Next-Gen Performance'
  }
];

export default function Login() {
  const t = useTranslations();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const path = usePathname();

  // Video-like Storyboard Animation Controls
  const [activeScene, setActiveScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveScene((prev) => (prev + 1) % SCENES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [isPlaying]);

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
    <main className="min-h-screen grid lg:grid-cols-12 bg-slate-950 text-slate-100 relative overflow-hidden font-sans select-none">
      {/* Dynamic Cyber Grid & Animated Background Orbs */}
      <div className="absolute inset-0 cyber-grid-bg opacity-40 pointer-events-none"></div>
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-600/25 rounded-full blur-[140px] glowing-orb-1 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-purple-600/25 rounded-full blur-[160px] glowing-orb-2 pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none"></div>

      {/* LEFT SECTION: Video-like Motion Graphics & Growth Showcase (Cols 1-7) */}
      <section className="hidden lg:flex lg:col-span-7 p-10 xl:p-14 flex-col justify-between relative z-10 border-r border-white/10 bg-slate-900/40 backdrop-blur-xl">
        
        {/* Top Header & Brand Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 border border-indigo-400/40">
              <Building2 size={26} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-white">{t('app.name')}</h1>
              <p className="text-[11px] font-semibold tracking-wider text-indigo-300 uppercase">Growth Intelligence Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-time Analytics Engine</span>
          </div>
        </div>

        {/* CENTER VIDEO MOTION GRAPHIC CONTAINER */}
        <div className="my-auto py-6 space-y-6">
          
          {/* Video Storyboard Timeline Progress Bars */}
          <div className="bg-slate-900/70 p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase tracking-wider font-extrabold">
                  {SCENES[activeScene].badge}
                </span>
                <span>Scene {activeScene + 1} of 3: {SCENES[activeScene].title}</span>
              </div>
              
              {/* Playback Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveScene((prev) => (prev === 0 ? SCENES.length - 1 : prev - 1))}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                  title="Previous Scene"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/40"
                  title={isPlaying ? 'Pause Animation' : 'Play Animation'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={() => setActiveScene((prev) => (prev + 1) % SCENES.length)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                  title="Next Scene"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Timeline Segment Bars */}
            <div className="grid grid-cols-3 gap-2">
              {SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(idx)}
                  className="h-1.5 rounded-full bg-white/10 overflow-hidden relative cursor-pointer group"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      idx === activeScene
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 ' + (isPlaying ? 'timeline-progress-active' : 'w-full')
                        : idx < activeScene
                        ? 'w-full bg-indigo-500/70'
                        : 'w-0'
                    }`}
                  ></div>
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC SCENE DISPLAY WINDOW */}
          <div className="relative rounded-3xl bg-slate-900/80 border border-white/15 p-7 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between group">
            <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-20">
              <Sparkles size={160} className="text-indigo-400" />
            </div>

            {/* SCENE 1: FINANCIAL & REVENUE ROCKET */}
            {activeScene === 0 && (
              <div className="space-y-6 stagger-item">
                <div className="flex items-start justify-between">
                  <div>

                    <h2 className="text-3xl font-black text-white tracking-tight">Exponential Financial Trajectory</h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time revenue metrics & enterprise scaling statistics</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
                      $128.5M
                    </span>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Annual Recurring Revenue</p>
                  </div>
                </div>

                {/* Animated SVG Multi-Curve Chart */}
                <div className="relative h-44 w-full pt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                      d="M 0,130 Q 100,110 200,85 T 380,40 T 500,10 L 500,140 L 0,140 Z"
                      fill="url(#areaGradient)"
                    />
                    
                    {/* Animated Stroke Path */}
                    <path
                      d="M 0,130 Q 100,110 200,85 T 380,40 T 500,10"
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className="draw-path"
                    />

                    {/* Pulsing Data Points */}
                    <circle cx="200" cy="85" r="6" fill="#a855f7" className="animate-pulse" />
                    <circle cx="380" cy="40" r="6" fill="#ec4899" className="animate-pulse" />
                    <circle cx="500" cy="10" r="8" fill="#10b981" className="pulse-ring" />
                  </svg>

                  {/* Dynamic Floating Stat Cards */}
                  <div className="absolute top-2 right-4 bg-slate-800/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2">
                    <ArrowUpRight size={16} className="text-emerald-400 animate-bounce" />
                    <div>
                      <div className="text-xs font-black text-emerald-300">Q3 Target Exceeded</div>
                      <div className="text-[10px] text-slate-400 font-semibold">142.8% of forecast</div>
                    </div>
                  </div>
                </div>

                {/* Growth Metric Pills */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Gross Profit</span>
                    <span className="text-lg font-black text-indigo-300">84.2%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Net Retention</span>
                    <span className="text-lg font-black text-purple-300">138%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Customer LTV</span>
                    <span className="text-lg font-black text-emerald-300">$48.5K</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2: GLOBAL NETWORK REACH */}
            {activeScene === 1 && (
              <div className="space-y-6 stagger-item">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30 mb-2">
                      <Globe size={14} />
                      Global Infrastructure Grid
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Worldwide Scalability</h2>
                    <p className="text-slate-400 text-sm mt-1">Multi-region deployment serving millions of concurrent requests</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-indigo-400">1.2M+</span>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Active Daily Users</p>
                  </div>
                </div>

                {/* Animated Edge Server Bars & Node Map Simulation */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> US-East Node (N. Virginia)
                      </span>
                      <span className="text-emerald-400 font-mono">11ms • 99.999% SLA</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-[96%] bar-grow"></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> EU-Central Node (Frankfurt)
                      </span>
                      <span className="text-emerald-400 font-mono">14ms • 100% SLA</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full w-[92%] bar-grow"></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span> AP-East Node (Tokyo)
                      </span>
                      <span className="text-emerald-400 font-mono">18ms • 99.98% SLA</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full w-[88%] bar-grow"></div>
                    </div>
                  </div>
                </div>

                {/* Node Network Stat Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-xl font-black text-white">45+</span>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mt-0.5">Countries</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-xl font-black text-white">&lt;14ms</span>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mt-0.5">Edge Latency</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-xl font-black text-emerald-400">99.99%</span>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mt-0.5">Uptime SLA</span>
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 3: AI ANALYTICS & EFFICIENCY */}
            {activeScene === 2 && (
              <div className="space-y-6 stagger-item">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/30 mb-2">
                      <Zap size={14} />
                      AI Autonomous Operations
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Workforce Velocity Amplified</h2>
                    <p className="text-slate-400 text-sm mt-1">Autonomous workflows reducing enterprise processing overhead</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-purple-400">+68%</span>
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Efficiency Gain</p>
                  </div>
                </div>

                {/* AI Node Processing Visualization */}
                <div className="grid grid-cols-4 gap-2 py-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-center relative overflow-hidden group">
                    <Cpu size={20} className="mx-auto text-indigo-400 mb-1 animate-pulse" />
                    <span className="text-[11px] font-bold text-white block">Data Ingestion</span>
                    <span className="text-[9px] text-indigo-300 font-mono">1.4B records/s</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-center relative overflow-hidden group">
                    <Sparkles size={20} className="mx-auto text-purple-400 mb-1 animate-spin" />
                    <span className="text-[11px] font-bold text-white block">AI Processing</span>
                    <span className="text-[9px] text-purple-300 font-mono">LLM Synthesis</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-center relative overflow-hidden group">
                    <BarChart3 size={20} className="mx-auto text-fuchsia-400 mb-1" />
                    <span className="text-[11px] font-bold text-white block">Predictive BI</span>
                    <span className="text-[9px] text-fuchsia-300 font-mono">Auto Forecast</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center relative overflow-hidden group">
                    <Activity size={20} className="mx-auto text-emerald-400 mb-1" />
                    <span className="text-[11px] font-bold text-white block">Action Executed</span>
                    <span className="text-[9px] text-emerald-300 font-mono">Instant Dispatch</span>
                  </div>
                </div>

                {/* Efficiency Stats */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Manual Hours Saved</span>
                      <span className="text-2xl font-black text-purple-300">42,500 hrs/mo</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                      <Zap size={20} />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Cost Reduction</span>
                      <span className="text-2xl font-black text-emerald-300">-$3.4M/yr</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM LIVE TICKER MARQUEE */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 border border-white/10 py-3 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3 whitespace-nowrap text-xs font-bold text-indigo-200">
            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] uppercase font-black shrink-0 tracking-wider">
              LIVE ACHIEVEMENTS
            </span>
            <div className="flex items-center gap-6 animate-pulse">
              <span>🚀 Q3 ARR hit $128.5M (+342% YoY)</span>
              <span>•</span>
              <span>🌍 Expanded to Tokyo & Frankfurt Edge Regions</span>
              <span>•</span>
              <span>🛡️ SOC2 Type II & ISO 27001 Certified</span>
              <span>•</span>
              <span>⚡ 99.99% Guaranteed SLA Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT SECTION: Clean & Secure Login Form (Cols 8-12) */}
      <section className="col-span-12 lg:col-span-5 flex items-center justify-center p-6 md:p-12 relative z-10 bg-slate-950">
        
        {/* Language Switcher */}
        <button
          className="btn bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white absolute top-6 right-6 text-xs rounded-full px-4 py-2 border border-white/15 flex items-center gap-2 backdrop-blur-md transition-all font-bold group shadow-lg"
          onClick={() => router.replace(path, { locale: locale === 'vi' ? 'en' : 'vi' })}
        >
          <Languages size={16} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
          <span>{locale === 'vi' ? 'English' : 'Tiếng Việt'}</span>
        </button>

        <div className="w-full max-w-md stagger-item delay-100">
          <div className="p-8 sm:p-10 rounded-[2.5rem] bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl hover-extreme-3d glow-card relative">
            
            {/* Form Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest mb-3 border border-indigo-500/20">
                <ShieldCheck size={14} />
                Secure Portal Login
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight title-gradient">
                {t('auth.login')}
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1.5">{t('auth.subtitle')}</p>
            </div>

            {/* Login Form (No Demo Presets Displayed) */}
            <form onSubmit={handleSubmit(submit)} className="space-y-5">
              <div>
                <label className="label text-slate-300 font-bold">{t('fields.email')}</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    className="input pl-11 bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800"
                    placeholder="name@company.com"
                    autoComplete="email"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="error">{t('validation.email')}</p>}
              </div>

              <div>
                <label className="label text-slate-300 font-bold">{t('fields.password')}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    className="input pl-11 pr-11 bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="error">{t('validation.min8')}</p>}
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-bold shadow-sm animate-pulse">
                  {error}
                </div>
              )}

              <button
                className="btn btn-primary w-full py-4 text-base font-black shadow-xl shadow-indigo-500/25 rounded-2xl mt-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {t('common.loading')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>{t('auth.login')}</span>
                    <ArrowUpRight size={18} />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-500 font-semibold">
              <span>© 2026 {t('app.name')}. Enterprise Security Enforced.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
