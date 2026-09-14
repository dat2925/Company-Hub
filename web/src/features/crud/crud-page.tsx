'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Eye, LayoutGrid, List, Pencil, Plus, Search, Trash2, UserPlus, X, Sparkles, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { api } from '@/lib/api/client';
import { Item } from '@/types';
import { ResourceConfig } from './config';
import { ResourceForm } from './resource-form';
import { Portal } from '@/components/ui/portal';

type Mode = 'create' | 'edit' | 'view' | 'delete' | 'admin' | null;

const adminConfig: ResourceConfig = { 
  key: 'companies', 
  endpoint: '/companies', 
  columns: [], 
  fields: [
    { name: 'fullName', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'password', type: 'password', required: true }
  ] 
};

const display = (value: unknown, t: (key: string) => string) => {
  if (value == null || value === '') return '—';
  if (typeof value === 'object') {
    if ('name' in value) return String((value as { name: unknown }).name);
    if ('fullName' in value) return String((value as { fullName: unknown }).fullName);
  }
  if (typeof value === 'string' && ['ACTIVE', 'INACTIVE', 'PLANNING', 'COMPLETED', 'CANCELLED', 'SCHEDULED', 'OPEN', 'IN_PROGRESS', 'DONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(value)) {
    const statusKey = value.toLowerCase();
    return <span className={`badge badge-${statusKey}`}>{t(`statuses.${value}`)}</span>;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString();
  return String(value);
};

interface CrudPageProps {
  config: ResourceConfig;
  queryParams?: Record<string, string>;
  fixedValues?: Record<string, string>;
  hiddenFields?: string[];
  embedded?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function CrudPage({ config, queryParams, fixedValues, hiddenFields = [], embedded = false, canCreate = true, canEdit = true, canDelete = true }: CrudPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>(null);
  const [selected, setSelected] = useState<Item>();
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('table');

  const list = useQuery({
    queryKey: [config.key, page, query, queryParams],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: '10', search: query, ...queryParams });
      return api.get<Item[]>(`${config.endpoint}?${params.toString()}`);
    }
  });

  const save = useMutation({
    mutationFn: (data: Record<string, string>) => {
      const payload = { ...data, ...fixedValues };
      return mode === 'admin' && selected
      ? api.post(`${config.endpoint}/${selected.id}/admin`, payload)
      : mode === 'edit' && selected
      ? api.patch(`${config.endpoint}/${selected.id}`, payload)
      : api.post(config.endpoint, payload);
    },
    onSuccess: () => {
      toast.success(t(mode === 'admin' ? 'toast.adminCreated' : 'toast.saved'));
      setMode(null);
      void queryClient.invalidateQueries({ queryKey: [config.key] });
    },
    onError: e => toast.error(e.message)
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`${config.endpoint}/${selected?.id}`),
    onSuccess: () => {
      toast.success(t('toast.deleted'));
      setMode(null);
      void queryClient.invalidateQueries({ queryKey: [config.key] });
    },
    onError: e => toast.error(e.message)
  });

  const open = (nextMode: Mode, item?: Item) => {
    if (nextMode === 'view' && (config.key === 'projects' || config.key === 'departments') && item) {
      router.push(`/${config.key}/${item.id}`);
      return;
    }
    setSelected(item);
    setMode(nextMode);
  };
  const openDetail = (item: Item) => {
    if (config.key === 'projects' || config.key === 'departments') router.push(`/${config.key}/${item.id}`);
  };
  const formConfig = hiddenFields.length === 0
    ? config
    : { ...config, fields: config.fields.filter(field => !hiddenFields.includes(field.name)) };
  const body = list.data?.data ?? [];
  const meta = list.data?.meta;

  return (
    <section className={`space-y-8 py-4 ${embedded ? '' : 'perspective-2000'}`}>
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 stagger-item delay-100">
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest mb-3 border border-indigo-200/50 shadow-xs float-3d">
            <Sparkles size={14} />
            Data Operations
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight title-gradient">
            {t(`${config.key}.title`)}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl text-sm sm:text-base">{t(`${config.key}.description`)}</p>
        </div>

        {canCreate && <div className="flex items-center gap-3">
          <button 
            className="btn btn-primary rounded-2xl shadow-xl shadow-indigo-500/25 px-6 py-3.5 hover-extreme-3d glow-card" 
            onClick={() => open('create')}
          >
            <Plus size={20} className="animate-pulse" />
            <span className="font-bold text-base">{t('common.actions.create')}</span>
          </button>
        </div>}
      </div>

      {/* Main Glass Card Workspace */}
      <div className="stagger-item delay-200 card bg-white/80 backdrop-blur-2xl shadow-2xl border border-white/90 rounded-[2.5rem] overflow-hidden">
        
        {/* Search & Layout View Controls */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <form className="relative flex-1 w-full flex gap-3" onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search); }}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-indigo-500" size={19} />
              <input 
                className="input pl-11 pr-10 bg-white/90 border-slate-200 text-sm font-semibold py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/20" 
                value={search} 
                onChange={event => setSearch(event.target.value)} 
                placeholder={t('common.search')} 
              />
              {search && (
                <button 
                  type="button" 
                  onClick={() => { setSearch(''); setQuery(''); setPage(1); }} 
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-secondary bg-white border-slate-200 shadow-xs hover:border-indigo-300 rounded-xl px-6 font-bold text-sm">
              {t('common.searchButton')}
            </button>
          </form>

          {/* Grid / List Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60 shrink-0">
            <button
              onClick={() => setViewLayout('table')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${viewLayout === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${viewLayout === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Content Loading / Empty / Data Display */}
        {list.isLoading ? (
          <div className="p-24 text-center flex flex-col items-center justify-center gap-4 text-indigo-600">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="font-bold text-base animate-pulse">{t('common.loading')}</span>
          </div>
        ) : list.isError ? (
          <div className="p-20 text-center text-rose-600 font-bold text-lg">{t('common.error')}</div>
        ) : body.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-2">
              <RefreshCw size={28} />
            </div>
            <p className="font-bold text-lg text-slate-600">{t('common.empty')}</p>
            <p className="text-sm font-medium text-slate-400">Try adjusting search criteria or add new entries.</p>
          </div>
        ) : viewLayout === 'grid' ? (
          /* Grid View Cards */
          <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {body.map((row, rowIdx) => (
              <div 
                key={row.id}
                className={`stagger-item delay-${(rowIdx % 6 + 1) * 100} card p-6 bg-white/90 border border-slate-200/70 hover-extreme-3d flex flex-col justify-between h-full relative overflow-hidden group ${config.key === 'projects' || config.key === 'departments' ? 'cursor-pointer' : ''}`}
                onClick={event => { if (!(event.target as HTMLElement).closest('button')) openDetail(row); }}
              >
                <div className="space-y-3">
                  {config.columns.map((column) => (
                    <div key={column} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{t(`fields.${column}`)}</span>
                      <div className="font-bold text-slate-800 text-sm truncate max-w-[200px] sm:max-w-[250px] lg:max-w-xs" title={typeof row[column] === 'string' ? row[column] as string : undefined}>
                        {display(row[column], t)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  {config.key === 'companies' && (
                    <button className="btn bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 p-2 rounded-xl" title={t('common.actions.createAdmin')} onClick={() => open('admin', row)}>
                      <UserPlus size={16} />
                    </button>
                  )}
                  <button className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 p-2 rounded-xl" title={t('common.actions.view')} onClick={() => open('view', row)}>
                    <Eye size={16} />
                  </button>
                  {canEdit && <button className="btn bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-200 p-2 rounded-xl" title={t('common.actions.edit')} onClick={() => open('edit', row)}>
                    <Pencil size={16} />
                  </button>}
                  {canDelete && <button className="btn bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 p-2 rounded-xl" title={t('common.actions.delete')} onClick={() => open('delete', row)}>
                    <Trash2 size={16} />
                  </button>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View Rows */
          <div className="bg-white/80 border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/70">
                    {config.columns.map((column) => (
                      <th key={column} className="px-6 py-4 text-xs font-black text-indigo-500 uppercase tracking-widest whitespace-nowrap">
                        {t(`fields.${column}`)}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase tracking-widest text-right whitespace-nowrap">
                      {t('common.actions.title')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {body.map((row, rowIdx) => (
                    <tr 
                      key={row.id} 
                      className={`stagger-item delay-${(rowIdx % 8 + 1) * 100} hover:bg-slate-50/50 transition-colors group ${config.key === 'projects' || config.key === 'departments' ? 'cursor-pointer' : ''}`}
                      onClick={event => { if (!(event.target as HTMLElement).closest('button')) openDetail(row); }}
                    >
                      {config.columns.map((column) => (
                        <td key={column} className="px-6 py-4">
                          <div className="font-bold text-slate-800 text-sm truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-xs" title={typeof row[column] === 'string' ? row[column] as string : undefined}>
                            {display(row[column], t)}
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {config.key === 'companies' && (
                            <button className="btn bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 p-2 rounded-xl transition-all" title={t('common.actions.createAdmin')} onClick={() => open('admin', row)}>
                              <UserPlus size={17} />
                            </button>
                          )}
                          <button className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 p-2 rounded-xl transition-all" title={t('common.actions.view')} onClick={() => open('view', row)}>
                            <Eye size={17} />
                          </button>
                          {canEdit && <button className="btn bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-200 p-2 rounded-xl transition-all" title={t('common.actions.edit')} onClick={() => open('edit', row)}>
                            <Pencil size={17} />
                          </button>}
                          {canDelete && <button className="btn bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 p-2 rounded-xl transition-all" title={t('common.actions.delete')} onClick={() => open('delete', row)}>
                            <Trash2 size={17} />
                          </button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-200/80">
            {t('pagination.summary', { page: meta?.page ?? 1, total: meta?.totalPages ?? 1, items: meta?.totalItems ?? 0 })}
          </span>
          <div className="flex gap-2">
            <button 
              className="btn bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-600 shadow-xs p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-x-0.5 transition-all" 
              disabled={page <= 1} 
              onClick={() => setPage(value => value - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              className="btn bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-600 shadow-xs p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:translate-x-0.5 transition-all" 
              disabled={!meta || page >= meta.totalPages} 
              onClick={() => setPage(value => value + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {mode && (
        <Portal>
          <div className="modal-bg" role="dialog" aria-modal="true">
            <div className="modal border border-white/80 bg-white/95 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center pb-5 mb-6 border-b border-slate-100 relative z-10">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {t(`common.modal.${mode}`)} · <span className="title-gradient">{t(`${config.key}.title`)}</span>
              </h2>
              <button 
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors bg-slate-50 border border-slate-200/60" 
                onClick={() => setMode(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative z-10">
              {mode === 'view' && selected ? (
                <dl className="grid md:grid-cols-2 gap-4">
                  {formConfig.fields.filter(field => field.name !== 'password').map(field => {
                    const objectKey = field.name.endsWith('Id') ? field.name.replace(/Id$/, '') : field.name;
                    const valueToDisplay = (field.name.endsWith('Id') && selected[objectKey]) ? selected[objectKey] : selected[field.name];
                    return (
                      <div key={field.name} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 shadow-xs">
                        <dt className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{t(`fields.${field.name}`)}</dt>
                        <dd className="font-bold text-slate-800 mt-1.5 text-base break-words">{display(valueToDisplay, t)}</dd>
                      </div>
                    );
                  })}
                </dl>
              ) : mode === 'delete' ? (
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/20">
                    <Trash2 size={32} />
                  </div>
                  <p className="text-slate-800 font-bold text-lg mb-8">{t('common.deleteConfirm')}</p>
                  <div className="flex justify-center gap-4">
                    <button className="btn btn-secondary px-6 py-3 rounded-xl font-bold" onClick={() => setMode(null)}>
                      {t('common.actions.cancel')}
                    </button>
                    <button className="btn btn-danger px-6 py-3 rounded-xl font-bold hover:shadow-rose-500/30" onClick={() => remove.mutate()} disabled={remove.isPending}>
                      {t('common.actions.delete')}
                    </button>
                  </div>
                </div>
              ) : (
                <ResourceForm 
                  key={`${mode}-${selected?.id ?? 'new'}`} 
                  config={mode === 'admin' ? adminConfig : formConfig} 
                  item={mode === 'edit' ? selected : undefined} 
                  fixedValues={fixedValues}
                  onSubmit={data => save.mutate(data)} 
                  onCancel={() => setMode(null)} 
                  busy={save.isPending}
                />
              )}
            </div>
          </div>
        </div>
        </Portal>
      )}
    </section>
  );
}
