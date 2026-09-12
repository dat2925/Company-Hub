'use client';
import {useMutation,useQuery,useQueryClient} from '@tanstack/react-query';
import {ChevronLeft,ChevronRight,Eye,Pencil,Plus,Search,Trash2,UserPlus,X, Sparkles} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {toast} from 'sonner';
import {api} from '@/lib/api/client';
import {Item} from '@/types';
import {ResourceConfig} from './config';
import {ResourceForm} from './resource-form';

type Mode='create'|'edit'|'view'|'delete'|'admin'|null;

const adminConfig:ResourceConfig={key:'companies',endpoint:'/companies',columns:[],fields:[{name:'fullName',required:true},{name:'email',type:'email',required:true},{name:'password',type:'password',required:true}]};

const display=(value:unknown,t:(key:string)=>string)=>{
  if(value==null||value==='') return '—';
  if(typeof value==='object'){
    if('name' in value) return String((value as {name:unknown}).name);
    if('fullName' in value) return String((value as {fullName:unknown}).fullName);
  }
  if(typeof value==='string'&&['ACTIVE','INACTIVE','PLANNING','COMPLETED','CANCELLED','SCHEDULED','OPEN','IN_PROGRESS','DONE','LOW','MEDIUM','HIGH','URGENT'].includes(value)) {
    const statusKey = value.toLowerCase();
    return <span className={`badge badge-${statusKey} shadow-sm shadow-${statusKey}-500/20`}>{t(`statuses.${value}`)}</span>;
  }
  if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString();
  return String(value);
};

export function CrudPage({config}:{config:ResourceConfig}){
  const t=useTranslations();
  const queryClient=useQueryClient();
  const[page,setPage]=useState(1);
  const[search,setSearch]=useState('');
  const[query,setQuery]=useState('');
  const[mode,setMode]=useState<Mode>(null);
  const[selected,setSelected]=useState<Item>();

  const list=useQuery({
    queryKey:[config.key,page,query],
    queryFn:()=>api.get<Item[]>(`${config.endpoint}?page=${page}&pageSize=10&search=${encodeURIComponent(query)}`)
  });

  const save=useMutation({
    mutationFn:(data:Record<string,string>)=>mode==='admin'&&selected
      ?api.post(`${config.endpoint}/${selected.id}/admin`,data)
      :mode==='edit'&&selected
      ?api.patch(`${config.endpoint}/${selected.id}`,data)
      :api.post(config.endpoint,data),
    onSuccess:()=>{
      toast.success(t(mode==='admin'?'toast.adminCreated':'toast.saved'));
      setMode(null);
      void queryClient.invalidateQueries({queryKey:[config.key]});
    },
    onError:e=>toast.error(e.message)
  });

  const remove=useMutation({
    mutationFn:()=>api.delete(`${config.endpoint}/${selected?.id}`),
    onSuccess:()=>{
      toast.success(t('toast.deleted'));
      setMode(null);
      void queryClient.invalidateQueries({queryKey:[config.key]});
    },
    onError:e=>toast.error(e.message)
  });

  const open=(nextMode:Mode,item?:Item)=>{setSelected(item);setMode(nextMode);};
  const body=list.data?.data??[];
  const meta=list.data?.meta;

  return (
    <section className="space-y-10 perspective-2000 py-4">
      {/* 3D Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 stagger-item delay-100">
        <div className="relative">
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest mb-3 border border-indigo-200/50 shadow-sm float-3d">
            <Sparkles size={14} />
            Data Manager
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight title-gradient">
            {t(`${config.key}.title`)}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">{t(`${config.key}.description`)}</p>
        </div>
        <button className="btn btn-primary rounded-2xl shadow-xl shadow-indigo-500/30 px-6 py-4 hover-extreme-3d glow-card z-10" onClick={()=>open('create')}>
          <Plus size={20} className="animate-pulse" />
          <span className="font-bold text-lg">{t('common.actions.create')}</span>
        </button>
      </div>

      {/* Main 3D Card Area */}
      <div className="stagger-item delay-200 card bg-white/70 backdrop-blur-2xl shadow-2xl border border-white/80 rounded-[2rem] overflow-hidden">
        
        {/* Search Bar - Glass style */}
        <form className="p-6 border-b border-white/50 bg-slate-50/30 flex flex-col sm:flex-row gap-4" onSubmit={event=>{event.preventDefault();setPage(1);setQuery(search);}}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-indigo-400" size={20}/>
            <input className="input pl-12 bg-white/60 border-white shadow-inner text-base font-medium py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20" value={search} onChange={event=>setSearch(event.target.value)} placeholder={t('common.search')} />
          </div>
          <button className="btn btn-secondary bg-white border-white shadow-sm hover:shadow-md hover:border-indigo-200 rounded-xl px-8 font-bold">
            {t('common.searchButton')}
          </button>
        </form>

        {/* Content List */}
        {list.isLoading ? (
          <div className="p-24 text-center flex flex-col items-center justify-center gap-4 text-indigo-500">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="font-bold animate-pulse">{t('common.loading')}</span>
          </div>
        ) : list.isError ? (
          <div className="p-24 text-center text-rose-600 font-black text-xl">{t('common.error')}</div>
        ) : body.length===0 ? (
          <div className="p-24 text-center text-slate-400 font-bold text-lg bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">{t('common.empty')}</div>
        ) : (
          <div className="p-6 bg-slate-50/20 perspective-2000 grid gap-4">
            {/* Table Headers for Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 border-b border-slate-200/50">
              {config.columns.map((column, idx)=>(
                <div key={column} className={`col-span-${idx===0?'4':'2'} text-xs font-black text-indigo-400 uppercase tracking-widest`}>
                  {t(`fields.${column}`)}
                </div>
              ))}
              <div className="col-span-12 md:col-span-4 text-right text-xs font-black text-indigo-400 uppercase tracking-widest">
                {t('common.actions.title')}
              </div>
            </div>

            {/* 3D Row Cards */}
            {body.map((row, rowIdx)=>(
              <div 
                key={row.id} 
                className={`stagger-item delay-${(rowIdx%8+1)*100} group bg-white border border-slate-200/60 rounded-2xl p-4 md:p-6 shadow-sm hover-extreme-3d relative overflow-hidden flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 transition-all`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                {config.columns.map((column, idx)=>(
                  <div key={column} className={`col-span-${idx===0?'4':'2'} z-10 flex flex-col md:block`}>
                    <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(`fields.${column}`)}</span>
                    <span className="font-semibold text-slate-700">{display(row[column],t)}</span>
                  </div>
                ))}

                <div className="col-span-12 md:col-span-4 flex md:justify-end gap-2 z-10 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100 md:border-0">
                  {config.key==='companies' && (
                    <button className="btn bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 hover:border-purple-600 shadow-sm p-2.5 rounded-xl transition-all" title={t('common.actions.createAdmin')} onClick={()=>open('admin',row)}>
                      <UserPlus size={18}/>
                    </button>
                  )}
                  <button className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 shadow-sm p-2.5 rounded-xl transition-all" title={t('common.actions.view')} onClick={()=>open('view',row)}>
                    <Eye size={18}/>
                  </button>
                  <button className="btn bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-200 hover:border-amber-500 shadow-sm p-2.5 rounded-xl transition-all" title={t('common.actions.edit')} onClick={()=>open('edit',row)}>
                    <Pencil size={18}/>
                  </button>
                  <button className="btn bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 shadow-sm p-2.5 rounded-xl transition-all" title={t('common.actions.delete')} onClick={()=>open('delete',row)}>
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Pagination */}
        <div className="p-6 border-t border-white/50 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
            {t('pagination.summary',{page:meta?.page??1,total:meta?.totalPages??1,items:meta?.totalItems??0})}
          </span>
          <div className="flex gap-2">
            <button className="btn bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-600 shadow-sm p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-x-1 transition-all" disabled={page<=1} onClick={()=>setPage(value=>value-1)}>
              <ChevronLeft size={20}/>
            </button>
            <button className="btn bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-600 shadow-sm p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-1 transition-all" disabled={!meta||page>=meta.totalPages} onClick={()=>setPage(value=>value+1)}>
              <ChevronRight size={20}/>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Flip Modal Dialog */}
      {mode && (
        <div className="modal-bg" role="dialog" aria-modal="true">
          <div className="modal modal-flip border-2 border-white/60 bg-white/90 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-center pb-6 mb-6 border-b border-slate-100 relative z-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t(`common.modal.${mode}`)} · <span className="title-gradient">{t(`${config.key}.title`)}</span>
              </h2>
              <button className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors bg-slate-50 border border-slate-100" onClick={()=>setMode(null)}>
                <X size={22}/>
              </button>
            </div>

            <div className="relative z-10">
              {mode==='view'&&selected ? (
                <dl className="grid md:grid-cols-2 gap-5">
                  {config.fields.filter(field=>field.name!=='password').map(field=>(
                    <div key={field.name} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                      <dt className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t(`fields.${field.name}`)}</dt>
                      <dd className="font-bold text-slate-800 mt-2 text-base break-words">{display(selected[field.name],t)}</dd>
                    </div>
                  ))}
                </dl>
              ) : mode==='delete' ? (
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-rose-500/20">
                    <Trash2 size={36}/>
                  </div>
                  <p className="text-slate-800 font-bold text-lg mb-8">{t('common.deleteConfirm')}</p>
                  <div className="flex justify-center gap-4">
                    <button className="btn btn-secondary px-8 py-3 rounded-xl font-bold" onClick={()=>setMode(null)}>{t('common.actions.cancel')}</button>
                    <button className="btn btn-danger px-8 py-3 rounded-xl font-bold hover:shadow-rose-500/40" onClick={()=>remove.mutate()} disabled={remove.isPending}>{t('common.actions.delete')}</button>
                  </div>
                </div>
              ) : (
                <ResourceForm 
                  key={`${mode}-${selected?.id??'new'}`} 
                  config={mode==='admin'?adminConfig:config} 
                  item={mode==='edit'?selected:undefined} 
                  onSubmit={data=>save.mutate(data)} 
                  onCancel={()=>setMode(null)} 
                  busy={save.isPending}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
