// @ts-nocheck
/* eslint-disable */
import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, XCircle, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  useMySkills, 
  useUpdateEmployeeSkill, 
  useDeleteEmployeeSkill,
  useSkillOptions
} from '@/features/talent/api';
import { EmployeeSkill } from '@/types';
import { Portal } from '@/components/ui/portal';
import { toast } from 'sonner';
import { SkillRadarChart } from './skill-radar-chart';
import { SkillCard } from './skill-card';
import { useAuth } from '@/features/auth/auth-context';

const employeeSkillSchema = z.object({
  skillId: z.string().min(1, 'Vui lòng chọn kỹ năng'),
  level: z.coerce.number().min(1).max(5),
  yearsExperience: z.coerce.number().min(0).max(50),
  evidence: z.string().optional(),
  lastUsedAt: z.string().optional()
});

type EmployeeSkillFormData = z.infer<typeof employeeSkillSchema>;

export function MySkillsView() {
  const t = useTranslations();
  const { user } = useAuth();
  const { data: mySkillsData, isLoading } = useMySkills();
  const { data: skillOptions } = useSkillOptions();
  
  const updateMutation = useUpdateEmployeeSkill();
  const deleteMutation = useDeleteEmployeeSkill();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<EmployeeSkill | null>(null);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeSkillFormData>({
    resolver: zodResolver(employeeSkillSchema),
    defaultValues: { level: 1, yearsExperience: 0 }
  });

  const skills = mySkillsData || [];

  const filteredSkills = useMemo(() => {
    if (!search) return skills;
    return skills.filter(s => s.skill.name.toLowerCase().includes(search.toLowerCase()));
  }, [skills, search]);

  const openCreateModal = () => {
    setEditingSkill(null);
    reset({ skillId: '', level: 1, yearsExperience: 0, evidence: '', lastUsedAt: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (skill: EmployeeSkill) => {
    setEditingSkill(skill);
    reset({
      skillId: skill.skillId,
      level: skill.level,
      yearsExperience: skill.yearsExperience,
      evidence: skill.evidence || '',
      lastUsedAt: skill.lastUsedAt ? new Date(skill.lastUsedAt).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: EmployeeSkillFormData) => {
    if (!user?.employee?.id) return;
    
    // BE ignores source for EMPLOYEE and forces SELF_DECLARED.
    const payload = {
      employeeId: user.employee.id,
      skillId: data.skillId,
      level: data.level,
      yearsExperience: data.yearsExperience,
      source: 'SELF_DECLARED',
      evidence: data.evidence,
      lastUsedAt: data.lastUsedAt ? new Date(data.lastUsedAt).toISOString() : null
    };

    updateMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white/60 backdrop-blur-md rounded-3xl border border-white p-6 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          <h3 className="font-bold text-slate-800 text-center w-full mb-2">Biểu đồ năng lực</h3>
          <SkillRadarChart skills={skills} />
          {skills.length === 0 && (
            <div className="text-center text-slate-400 mt-4">
              <p className="text-sm">Chưa có dữ liệu năng lực</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800">Danh sách kỹ năng ({skills.length})</h3>
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-200"
            >
              <Plus size={16} /> Thêm kỹ năng
            </button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Tìm kiếm kỹ năng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex-1 min-h-[250px]">
            {filteredSkills.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-white/40 rounded-2xl border border-dashed border-slate-300">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Search size={20} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">Không tìm thấy kỹ năng nào</p>
                <p className="text-xs text-slate-400 mt-1 text-center">Hãy thêm kỹ năng mới hoặc điều chỉnh bộ lọc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredSkills.map(skill => (
                  <SkillCard 
                    key={skill.id} 
                    employeeSkill={skill} 
                    onEdit={skill.source === 'SELF_DECLARED' ? openEditModal : undefined}
                    // We only allow deleting SELF_DECLARED in FE visually, but BE would reject others anyway
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">
                  {editingSkill ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng mới'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kỹ năng *</label>
                  <select 
                    {...register('skillId')}
                    disabled={!!editingSkill}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
                  >
                    <option value="">Chọn kỹ năng...</option>
                    {skillOptions?.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name} ({opt.code})</option>
                    ))}
                  </select>
                  {errors.skillId && <p className="text-rose-500 text-xs mt-1">{errors.skillId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ (1-5) *</label>
                    <input 
                      type="number"
                      min={1} max={5}
                      {...register('level')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">1: Cơ bản, 5: Chuyên gia</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số năm kinh nghiệm *</label>
                    <input 
                      type="number"
                      step={0.5}
                      min={0}
                      {...register('yearsExperience')}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lần sử dụng gần nhất</label>
                  <input 
                    type="date"
                    {...register('lastUsedAt')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bằng chứng / Ghi chú</label>
                  <textarea 
                    {...register('evidence')}
                    rows={2}
                    placeholder="Mô tả dự án hoặc công việc bạn đã dùng kỹ năng này"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors text-sm"
                  >
                    {t('common.actions.cancel')}
                  </button>
                  <button 
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {updateMutation.isPending ? (
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
