// @ts-nocheck
/* eslint-disable */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  useSkills, 
  useCreateSkill, 
  useUpdateSkill, 
  useDeleteSkill 
} from '@/features/talent/api';
import { Skill } from '@/types';
import { Portal } from '@/components/ui/portal';
import { toast } from 'sonner';

const skillSchema = z.object({
  code: z.string().min(1, 'Required').transform(v => v.toUpperCase()),
  name: z.string().min(1, 'Required'),
  category: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

type SkillFormData = z.infer<typeof skillSchema>;

export function SkillsCatalog() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const { data: skillsData, isLoading } = useSkills({
    page,
    pageSize: 20,
    search: debouncedSearch,
    category: category || undefined,
    isActive: isActiveFilter === 'all' ? undefined : isActiveFilter === 'true'
  });

  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();
  const deleteMutation = useDeleteSkill();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: { isActive: true }
  });

  // Handle search debounce
  // (In a real app, use a custom hook like useDebounce, using a simple timeout here)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const handler = setTimeout(() => setDebouncedSearch(e.target.value), 500);
    return () => clearTimeout(handler);
  };

  const openCreateModal = () => {
    setEditingSkill(null);
    reset({ code: '', name: '', category: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);
    reset({
      code: skill.code,
      name: skill.name,
      category: skill.category || '',
      description: skill.description || '',
      isActive: skill.isActive
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: SkillFormData) => {
    if (editingSkill) {
      updateMutation.mutate(
        { id: editingSkill.id, ...data },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createMutation.mutate(
        data,
        { onSuccess: () => setIsModalOpen(false) }
      );
    }
  };

  const handleDelete = (skill: Skill) => {
    if (confirm(t('common.deleteConfirm'))) {
      deleteMutation.mutate(skill.id, {
        onError: (err: any) => {
          if (err.status === 409) {
            toast.error('Kỹ năng đang được sử dụng. Vui lòng chuyển sang trạng thái "Không hoạt động".');
          } else {
            toast.error(err.message);
          }
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
        <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <select 
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="true">{t('statuses.ACTIVE')}</option>
            <option value="false">{t('statuses.INACTIVE')}</option>
          </select>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-200"
        >
          <Plus size={16} /> {t('common.actions.create')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">{t('fields.code')}</th>
                <th className="px-6 py-4 font-bold">{t('fields.name')}</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">{t('fields.status')}</th>
                <th className="px-6 py-4 font-bold text-right">{t('common.actions.title')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : skillsData?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    {t('common.empty')}
                  </td>
                </tr>
              ) : (
                skillsData?.data.map((skill) => (
                  <tr key={skill.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-indigo-700 uppercase">
                      {skill.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {skill.name}
                      {skill.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{skill.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {skill.category ? (
                        <span className="px-2 py-1 bg-slate-100 rounded-md text-xs">{skill.category}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {skill.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                          <CheckCircle2 size={12} /> {t('statuses.ACTIVE')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
                          <XCircle size={12} /> {t('statuses.INACTIVE')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(skill)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          aria-label={t('common.actions.edit')}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(skill)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label={t('common.actions.delete')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        {skillsData?.meta && skillsData.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
            <span className="text-xs text-slate-500">
              {t('pagination.summary', { page: skillsData.meta.page, total: skillsData.meta.totalPages, items: skillsData.meta.totalItems })}
            </span>
            <div className="flex gap-1">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page === skillsData.meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">
                  {editingSkill ? t('common.modal.edit') : t('common.modal.create')}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('fields.code')} *</label>
                  <input 
                    {...register('code')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm uppercase focus:ring-2 focus:ring-indigo-500 font-mono"
                    placeholder="E.g. REACT, NODEJS"
                  />
                  {errors.code && <p className="text-rose-500 text-xs mt-1">{errors.code.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('fields.name')} *</label>
                  <input 
                    {...register('name')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g. React.js, Node.js"
                  />
                  {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input 
                    {...register('category')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g. Frontend, Backend, Soft Skills"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('fields.description')}</label>
                  <textarea 
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    {...register('isActive')}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    {t('fields.isActive')}
                  </label>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors text-sm"
                  >
                    {t('common.actions.cancel')}
                  </button>
                  <button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : null}
                    {t('common.actions.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
