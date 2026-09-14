'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { employeeGoalSchema, EmployeeGoalFormValues } from '../schemas';
import { useEmployeeGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../api';
import { EmployeeGoal } from '../types';
import { Target, Plus, X, Trash2, Edit2, Clock } from 'lucide-react';

export function ImpactGoals({ employeeId, readOnly = false }: { employeeId?: string; readOnly?: boolean }) {
  const t = useTranslations();
  const [filter, setFilter] = useState('ACTIVE');
  const { data: goals, isLoading } = useEmployeeGoals({ page: 1, pageSize: 50, employeeId, status: filter });
  
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<EmployeeGoal | null>(null);

  const deleteMutation = useDeleteGoal();

  const handleDelete = (id: string) => {
    if (confirm(t('common.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (goal: EmployeeGoal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Target className="text-purple-500" size={20} /> Mục tiêu cá nhân
          </h3>
          <p className="text-xs text-slate-500 mt-1">Theo dõi tiến độ và định hướng phát triển</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['ACTIVE', 'COMPLETED', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t(`impact.goalStatus.${status}`)}
              </button>
            ))}
          </div>
          {!readOnly && (
            <button 
              onClick={() => { setEditingGoal(null); setShowForm(true); }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-1"
            >
              <Plus size={16} /> Thêm
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
        </div>
      ) : (goals || []).length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl border-dashed">
          <Target size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-bold text-slate-500">Chưa có mục tiêu nào</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals?.map(goal => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onEdit={() => handleEdit(goal)} 
              onDelete={() => handleDelete(goal.id)} 
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {showForm && (
        <GoalForm 
          employeeId={employeeId} 
          goal={editingGoal} 
          onClose={() => { setShowForm(false); setEditingGoal(null); }} 
        />
      )}
    </div>
  );
}

function GoalCard({ goal, onEdit, onDelete, readOnly }: { goal: EmployeeGoal; onEdit: () => void; onDelete: () => void; readOnly: boolean }) {
  const isOverdue = goal.status === 'ACTIVE' && goal.targetDate && new Date(goal.targetDate) < new Date();
  
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative group overflow-hidden">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${goal.status === 'COMPLETED' ? 'bg-emerald-400' : goal.status === 'CANCELLED' ? 'bg-slate-300' : isOverdue ? 'bg-rose-400' : 'bg-purple-400'}`}></div>
      
      <div className="flex justify-between items-start mb-2 pl-2">
        <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug pr-8">{goal.title}</h4>
        {!readOnly && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-white/90 backdrop-blur pl-2 rounded-l-xl">
            <button onClick={onEdit} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"><Edit2 size={14} /></button>
            <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"><Trash2 size={14} /></button>
          </div>
        )}
      </div>
      
      {goal.description && <p className="text-xs text-slate-500 mb-4 pl-2 line-clamp-2">{goal.description}</p>}
      
      <div className="pl-2 mt-4">
        <div className="flex justify-between text-[10px] font-bold mb-1.5">
          <span className="text-slate-500 uppercase tracking-wider">Tiến độ</span>
          <span className={goal.progress === 100 ? 'text-emerald-600' : 'text-indigo-600'}>{goal.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`} 
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between pl-2 mt-4 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
          <Clock size={12} /> 
          <span>Bắt đầu: {new Date(goal.startDate).toLocaleDateString()}</span>
        </div>
        {goal.targetDate && (
          <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded ${isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
            Mục tiêu: {new Date(goal.targetDate).toLocaleDateString()}
            {isOverdue && ' (Quá hạn)'}
          </div>
        )}
      </div>
    </div>
  );
}

function GoalForm({ employeeId, goal, onClose }: { employeeId?: string; goal?: EmployeeGoal | null; onClose: () => void }) {
  const t = useTranslations();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const isEditing = !!goal;

  const form = useForm<EmployeeGoalFormValues>({
    resolver: zodResolver(employeeGoalSchema),
    defaultValues: {
      employeeId: employeeId || undefined,
      title: goal?.title || '',
      description: goal?.description || '',
      progress: goal?.progress || 0,
      status: goal?.status || 'ACTIVE',
      startDate: goal?.startDate ? goal.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      targetDate: goal?.targetDate ? goal.targetDate.split('T')[0] : ''
    }
  });

  const onSubmit = (data: EmployeeGoalFormValues) => {
    if (isEditing) {
      updateMutation.mutate({ id: goal.id, ...data }, { onSuccess: onClose });
    } else {
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Target className="text-purple-500" size={20} />
            {isEditing ? 'Sửa mục tiêu' : 'Tạo mục tiêu mới'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form id="goal-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Tên mục tiêu</label>
              <input type="text" {...form.register('title')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              {form.formState.errors.title && <p className="text-[10px] text-rose-500">{form.formState.errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Mô tả chi tiết</label>
              <textarea {...form.register('description')} rows={2} className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Ngày bắt đầu</label>
                <input type="date" {...form.register('startDate')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Ngày kết thúc (dự kiến)</label>
                <input type="date" {...form.register('targetDate')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>
            </div>

            {isEditing && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Trạng thái</label>
                  <select {...form.register('status')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                    <option value="ACTIVE">{t('impact.goalStatus.ACTIVE')}</option>
                    <option value="COMPLETED">{t('impact.goalStatus.COMPLETED')}</option>
                    <option value="CANCELLED">{t('impact.goalStatus.CANCELLED')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Tiến độ (%)</label>
                  <input type="number" min={0} max={100} {...form.register('progress', { valueAsNumber: true })} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            {t('common.actions.cancel')}
          </button>
          <button type="submit" form="goal-form" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50">
            {t('common.actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
