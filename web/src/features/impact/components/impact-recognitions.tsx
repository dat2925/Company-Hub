'use client';
import { useState, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { recognitionSchema, RecognitionFormValues } from '../schemas';
import { useImpactFeed, useRecognitions, useCreateRecognition } from '../api';
import { useAuth } from '@/features/auth/auth-context';
import { api } from '@/lib/api/client';
import { useQuery } from '@tanstack/react-query';
import { ThumbsUp, Medal, MessageSquare, X, ArrowRight, Trophy } from 'lucide-react';

export function ImpactRecognitions() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'FEED' | 'MINE'>('FEED');
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Medal className="text-blue-500" size={20} /> Ghi nhận & Bảng tin
          </h3>
          <p className="text-xs text-slate-500 mt-1">Gửi lời cảm ơn và theo dõi thành tích toàn công ty</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('FEED')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${tab === 'FEED' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Bảng tin công ty
            </button>
            <button
              onClick={() => setTab('MINE')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${tab === 'MINE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Dành cho tôi
            </button>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
          >
            <ThumbsUp size={16} /> Ghi nhận
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-6 min-h-[400px]">
        {tab === 'FEED' ? <CompanyFeed /> : <MyRecognitions employeeId={user?.employee?.id} />}
      </div>

      {showForm && <RecognitionForm onClose={() => setShowForm(false)} currentEmployeeId={user?.employee?.id} />}
    </div>
  );
}

function CompanyFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useImpactFeed(20);

  if (isLoading) {
    return <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
      {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl"></div>)}
    </div>;
  }

  const items = data?.pages.flat() || [];

  if (items.length === 0) {
    return (
      <div className="p-10 text-center">
        <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="font-bold text-slate-500 text-lg">Bảng tin trống</p>
        <p className="text-slate-400 mt-2">Chưa có thành tích hoặc lời ghi nhận nào được chia sẻ công khai.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {items.map((item, idx) => (
        <Fragment key={idx}>
          {item.kind === 'IMPACT_ENTRY' ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 font-bold flex items-center justify-center">
                  {item.item.employee.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{item.item.employee.fullName}</h4>
                  <p className="text-[10px] font-medium text-slate-400">{new Date(item.occurredAt).toLocaleString()}</p>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider border border-amber-100 flex items-center gap-1">
                    <Trophy size={10} /> Thành tựu
                  </span>
                </div>
              </div>
              <h5 className="font-bold text-slate-800 mb-2">{item.item.title}</h5>
              {item.item.description && <p className="text-sm text-slate-600 mb-3">{item.item.description}</p>}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-400"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center">
                  {item.item.sender.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{item.item.sender.fullName}</h4>
                  <p className="text-[10px] font-medium text-slate-400">{new Date(item.occurredAt).toLocaleString()}</p>
                </div>
                <ArrowRight size={16} className="text-slate-300 mx-1" />
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs flex items-center justify-center">
                  {item.item.receiver.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs leading-none">{item.item.receiver.fullName}</h4>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider border border-blue-100 flex items-center gap-1">
                    <ThumbsUp size={10} /> Ghi nhận
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-700 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                &quot;{item.item.message}&quot;
              </p>
              {item.item.skill && (
                <div className="mt-3 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  Kỹ năng: <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{item.item.skill.name}</span>
                </div>
              )}
            </div>
          )}
        </Fragment>
      ))}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {isFetchingNextPage ? 'Đang tải...' : 'Tải thêm'}
        </button>
      )}
    </div>
  );
}

function MyRecognitions({ employeeId }: { employeeId?: string }) {
  const { data, isLoading } = useRecognitions({ page: 1, pageSize: 50, employeeId });

  if (isLoading) {
    return <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
      <div className="h-24 bg-white rounded-2xl"></div>
    </div>;
  }

  const items = data || [];

  if (items.length === 0) {
    return (
      <div className="p-10 text-center">
        <ThumbsUp size={48} className="mx-auto text-slate-200 mb-4" />
        <p className="font-bold text-slate-500 text-lg">Chưa có lời ghi nhận nào</p>
        <p className="text-slate-400 mt-2">Những lời cảm ơn và khen ngợi từ đồng nghiệp sẽ hiển thị ở đây.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100/50 flex gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0">
            {item.sender.fullName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-slate-800">{item.sender.fullName}</span>
              <span className="text-slate-400 text-xs">đã gửi một lời ghi nhận</span>
              <span className="text-slate-300 text-[10px] ml-2">{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-slate-700 italic bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 mb-2">
              &quot;{item.message}&quot;
            </p>
            {item.skill && (
              <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                {item.skill.name}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecognitionForm({ onClose, currentEmployeeId }: { onClose: () => void; currentEmployeeId?: string }) {
  const t = useTranslations();
  const createMutation = useCreateRecognition();

  // Fetch employees options, filter out current user
  const { data: employees } = useQuery({
    queryKey: ['employees-options'],
    queryFn: () => api.get<Record<string, unknown>[]>('/employees/options/list').then(res => res.data as {id: string, fullName: string, employeeCode: string}[])
  });
  
  const { data: skills } = useQuery({
    queryKey: ['skills-options'],
    queryFn: () => api.get<Record<string, unknown>[]>('/skills/options/list').then(res => res.data as {id: string, name: string}[])
  });

  const availableEmployees = employees?.filter(e => e.id !== currentEmployeeId) || [];

  const form = useForm<RecognitionFormValues>({
    resolver: zodResolver(recognitionSchema),
    defaultValues: {
      receiverEmployeeId: '',
      skillId: '',
      message: '',
      visibility: 'COMPANY'
    }
  });

  const onSubmit = (data: RecognitionFormValues) => {
    createMutation.mutate(data, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <ThumbsUp className="text-blue-500" size={20} />
            Gửi lời ghi nhận
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form id="recognition-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Người nhận</label>
              <select {...form.register('receiverEmployeeId')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                <option value="">{t('common.select')}</option>
                {availableEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeCode})</option>
                ))}
              </select>
              {form.formState.errors.receiverEmployeeId && <p className="text-[10px] text-rose-500">{form.formState.errors.receiverEmployeeId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Kỹ năng liên quan (Tùy chọn)</label>
              <select {...form.register('skillId')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                <option value="">Không chọn kỹ năng cụ thể</option>
                {skills?.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Lời nhắn</label>
              <textarea {...form.register('message')} rows={4} placeholder="Ví dụ: Cảm ơn bạn đã hỗ trợ dự án rất nhiệt tình tuần qua..." className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none" />
              {form.formState.errors.message && <p className="text-[10px] text-rose-500">{form.formState.errors.message.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Quyền riêng tư</label>
              <select {...form.register('visibility')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                <option value="COMPANY">{t('impact.visibility.COMPANY')}</option>
                <option value="MANAGER">{t('impact.visibility.MANAGER')}</option>
                <option value="PRIVATE">{t('impact.visibility.PRIVATE')}</option>
              </select>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            {t('common.actions.cancel')}
          </button>
          <button type="submit" form="recognition-form" disabled={createMutation.isPending} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
            {createMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            Gửi ghi nhận
          </button>
        </div>
      </div>
    </div>
  );
}
