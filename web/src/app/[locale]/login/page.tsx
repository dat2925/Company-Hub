'use client';
import {zodResolver} from '@hookform/resolvers/zod';
import {Building2,CheckCircle2,Languages,Lock,Mail,ShieldCheck} from 'lucide-react';
import {useLocale,useTranslations} from 'next-intl';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {useAuth} from '@/features/auth/auth-context';
import {usePathname,useRouter} from '@/i18n/navigation';

const schema=z.object({email:z.string().email(),password:z.string().min(8)});
type Form=z.infer<typeof schema>;

export default function Login(){
  const t=useTranslations();
  const{login}=useAuth();
  const[error,setError]=useState('');
  const locale=useLocale();
  const router=useRouter();
  const path=usePathname();

  const{register,handleSubmit,formState:{errors,isSubmitting}}=useForm<Form>({
    resolver:zodResolver(schema),
    defaultValues:{email:'admin@company1.com',password:'Demo@123'}
  });

  const submit=async(v:Form)=>{
    try{
      setError('');
      await login(v.email,v.password);
    }catch(e){
      setError(e instanceof Error?e.message:t('common.error'));
    }
  };

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left hero side */}
      <section className="hidden lg:flex bg-gradient-to-br from-indigo-700 via-purple-700 to-violet-900 text-white p-12 xl:p-16 flex-col justify-between relative overflow-hidden perspective-container">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none pulse-glow-3d"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none pulse-glow-3d" style={{animationDelay: '1.5s'}}></div>

        <div className="relative z-10 flex items-center gap-3 float-3d">
          <span className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <Building2 size={32} className="text-white"/>
          </span>
          <span className="font-extrabold text-2xl tracking-tight text-white">{t('app.name')}</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-100">
            <ShieldCheck size={16} className="text-emerald-400"/>
            Enterprise Grade Platform
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {t('app.name')}
          </h1>
          <p className="text-indigo-100/90 text-lg leading-relaxed font-normal">
            {t('auth.tagline')}
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-sm font-medium text-indigo-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400"/>
              Multi-tenant architecture
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400"/>
              Role-based Access Control
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400"/>
              Real-time Workflows
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400"/>
              Integrated Dashboards
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-indigo-200/80 font-medium">
          © 2026 {t('app.name')}. All rights reserved.
        </div>
      </section>

      {/* Right form side */}
      <section className="flex items-center justify-center p-6 md:p-12 relative">
        <button 
          className="btn btn-secondary absolute top-6 right-6 text-xs rounded-full px-3.5 py-1.5 shadow-2xs hover:border-indigo-300 hover:text-indigo-600 flex items-center gap-1.5" 
          onClick={()=>router.replace(path,{locale:locale==='vi'?'en':'vi'})}
        >
          <Languages size={15}/>
          <span className="font-bold">{locale==='vi'?'EN':'VI'}</span>
        </button>

        <div className="w-full max-w-md perspective-container">
          <div className="card p-8 sm:p-10 shadow-xl border border-slate-200/80 rounded-2xl bg-white hover-3d glass-reflection">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{t('auth.login')}</h2>
              <p className="text-slate-500 text-sm mt-1.5">{t('auth.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <div>
                <label className="label">{t('fields.email')}</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400"/>
                  <input className="input pl-10" placeholder="name@company.com" {...register('email')}/>
                </div>
                {errors.email && <p className="error">{t('validation.email')}</p>}
              </div>

              <div>
                <label className="label">{t('fields.password')}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400"/>
                  <input className="input pl-10" type="password" placeholder="••••••••" {...register('password')}/>
                </div>
                {errors.password && <p className="error">{t('validation.min8')}</p>}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                  {error}
                </div>
              )}

              <button 
                className="btn btn-primary w-full py-3 text-base font-bold shadow-lg shadow-indigo-500/25 mt-2" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {t('common.loading')}
                  </span>
                ) : (
                  t('auth.login')
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <div className="inline-block px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                💡 {t('auth.demoHint')}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
