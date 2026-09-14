// @ts-nocheck
/* eslint-disable */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Target, Plus, Trash2, Edit2, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { 
  useProjectRequirements, 
  useUpdateProjectRequirement, 
  useDeleteProjectRequirement,
  useSkillOptions 
} from '@/features/talent/api';
import { ProjectTalentDrawer } from './project-talent-drawer';

interface ProjectRequirementsProps {
  projectId: string;
}

export function ProjectRequirements({ projectId }: ProjectRequirementsProps) {
  const t = useTranslations();
  
  const { data: requirements, isLoading } = useProjectRequirements(projectId);
  const { data: skillOptions } = useSkillOptions();
  
  const updateMutation = useUpdateProjectRequirement();
  const deleteMutation = useDeleteProjectRequirement();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { skillId: '', minimumLevel: 3, weight: 1, isRequired: true }
  });

  const onSubmit = (data: any) => {
    updateMutation.mutate(
      {
        projectId,
        skillId: data.skillId,
        minimumLevel: Number(data.minimumLevel),
        weight: Number(data.weight),
        isRequired: data.isRequired
      },
      {
        onSuccess: () => {
          setIsAdding(false);
          reset();
        }
      }
    );
  };

  const handleDelete = (skillId: string) => {
    if (confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
      deleteMutation.mutate({ projectId, skillId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
          <Target className="text-indigo-600" /> Năng lực cần thiết
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-indigo-600 rounded-xl text-sm font-bold transition-colors border border-slate-200"
          >
            <Plus size={16} /> Thêm kỹ năng
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-indigo-200"
          >
            <Users size={16} /> Ứng viên phù hợp
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 animate-in fade-in">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-700 mb-1">Kỹ năng</label>
              <select {...register('skillId')} required className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                <option value="">Chọn kỹ năng...</option>
                {skillOptions?.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>
            <div className="w-24 shrink-0">
              <label className="block text-xs font-bold text-slate-700 mb-1">Level tối thiểu</label>
              <input type="number" min={1} max={5} {...register('minimumLevel')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
            </div>
            <div className="w-24 shrink-0">
              <label className="block text-xs font-bold text-slate-700 mb-1">Trọng số (1-10)</label>
              <input type="number" min={1} max={10} {...register('weight')} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-2 mb-2 w-24">
              <input type="checkbox" id="isRequired" {...register('isRequired')} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
              <label htmlFor="isRequired" className="text-xs font-bold text-slate-700">Bắt buộc</label>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium">Hủy</button>
              <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Lưu</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-slate-400">{t('common.loading')}</div>
      ) : requirements?.length === 0 ? (
        <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <p className="text-slate-500 font-medium">Chưa có yêu cầu năng lực nào được cấu hình cho dự án này.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold">
              <tr>
                <th className="px-6 py-3">Kỹ năng</th>
                <th className="px-6 py-3 text-center">Level tối thiểu</th>
                <th className="px-6 py-3 text-center">Trọng số</th>
                <th className="px-6 py-3 text-center">Loại</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requirements?.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-800">{req.skill.name} <span className="text-[10px] text-slate-500 ml-2 uppercase font-mono">{req.skill.code}</span></td>
                  <td className="px-6 py-4 text-center font-bold text-indigo-600">Lvl {req.minimumLevel}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600">{req.weight}</td>
                  <td className="px-6 py-4 text-center">
                    {req.isRequired ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded uppercase">Bắt buộc</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">Tùy chọn</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(req.skillId)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Matching Drawer */}
      <ProjectTalentDrawer 
        projectId={projectId} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}
