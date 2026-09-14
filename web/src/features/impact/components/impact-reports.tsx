'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { generateReportSchema, GenerateReportFormValues } from '../schemas';
import { useImpactReports, useGenerateReport, useUpdateReportDraft, useSubmitReport, useReviewReport } from '../api';
import { ImpactReport } from '../types';
import { FileText, Plus, X, Eye, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function ImpactReports({ employeeId, isAdmin = false }: { employeeId?: string; isAdmin?: boolean }) {
  const t = useTranslations();
  const [filter, setFilter] = useState(isAdmin ? 'SUBMITTED' : 'DRAFT');
  const { data: reports, isLoading } = useImpactReports({ page: 1, pageSize: 50, employeeId, status: filter });
  
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [viewingReport, setViewingReport] = useState<ImpactReport | null>(null);

  const statusOptions = isAdmin ? ['SUBMITTED', 'REVIEWED'] : ['DRAFT', 'SUBMITTED', 'REVIEWED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText className="text-emerald-500" size={20} /> Báo cáo tác động
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin ? 'Xem xét và đánh giá báo cáo từ nhân viên' : 'Tổng hợp thành tích và gửi quản lý duyệt'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${filter === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t(`impact.reportStatus.${status}`)}
              </button>
            ))}
          </div>
          {!isAdmin && (
            <button 
              onClick={() => setShowGenerateForm(true)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> Tạo báo cáo
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
        </div>
      ) : (reports || []).length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl border-dashed">
          <FileText size={40} className="mx-auto text-slate-200 mb-3" />
          <p className="font-bold text-slate-500">Chưa có báo cáo nào</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {reports?.map(report => (
            <div key={report.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative group">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                  report.status === 'DRAFT' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                  report.status === 'SUBMITTED' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {t(`impact.reportStatus.${report.status}`)}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {new Date(report.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h4 className="font-bold text-slate-800 mb-1">
                Báo cáo {t(`impact.reportPeriod.${report.period}`)}
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Từ {new Date(report.periodStart).toLocaleDateString()} đến {new Date(report.periodEnd).toLocaleDateString()}
              </p>

              {isAdmin && (
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-600 font-semibold bg-slate-50 px-3 py-2 rounded-lg">
                  Nhân viên: {report.employee?.fullName}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{report.snapshot.entries.length} Thành tích</span>
                  <span className="bg-slate-100 px-2 py-1 rounded-md">{report.snapshot.goals.length} Mục tiêu</span>
                </div>
                <button 
                  onClick={() => setViewingReport(report)}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Eye size={14} /> Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showGenerateForm && (
        <GenerateReportForm onClose={() => setShowGenerateForm(false)} />
      )}

      {viewingReport && (
        <ReportViewer report={viewingReport} isAdmin={isAdmin} onClose={() => setViewingReport(null)} />
      )}
    </div>
  );
}

function GenerateReportForm({ onClose }: { onClose: () => void }) {
  const t = useTranslations();
  const generateMutation = useGenerateReport();

  const form = useForm<GenerateReportFormValues>({
    resolver: zodResolver(generateReportSchema),
    defaultValues: {
      period: 'WEEKLY',
      periodStart: '',
      periodEnd: '',
      selfReflection: ''
    }
  });

  const onSubmit = (data: GenerateReportFormValues) => {
    generateMutation.mutate(data, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <FileText className="text-emerald-500" size={20} />
            Tạo báo cáo mới
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form id="generate-report-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Chu kỳ báo cáo</label>
              <select {...form.register('period')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none">
                <option value="WEEKLY">{t('impact.reportPeriod.WEEKLY')}</option>
                <option value="MONTHLY">{t('impact.reportPeriod.MONTHLY')}</option>
                <option value="QUARTERLY">{t('impact.reportPeriod.QUARTERLY')}</option>
                <option value="CUSTOM">{t('impact.reportPeriod.CUSTOM')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Từ ngày</label>
                <input type="date" {...form.register('periodStart')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                {form.formState.errors.periodStart && <p className="text-[10px] text-rose-500">{form.formState.errors.periodStart.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Đến ngày</label>
                <input type="date" {...form.register('periodEnd')} className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none" />
                {form.formState.errors.periodEnd && <p className="text-[10px] text-rose-500">{form.formState.errors.periodEnd.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase">Tự đánh giá (Tùy chọn)</label>
              <textarea {...form.register('selfReflection')} rows={3} placeholder="Những điểm tốt, cần cải thiện..." className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none" />
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            {t('common.actions.cancel')}
          </button>
          <button type="submit" form="generate-report-form" disabled={generateMutation.isPending} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50">
            Tạo bản nháp
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportViewer({ report, isAdmin, onClose }: { report: ImpactReport; isAdmin: boolean; onClose: () => void }) {
  const t = useTranslations();
  const updateDraft = useUpdateReportDraft();
  const submitReport = useSubmitReport();
  const reviewReport = useReviewReport();

  const [reflection, setReflection] = useState(report.selfReflection || '');
  const [managerComment, setManagerComment] = useState(report.managerComment || '');

  const handleSaveDraft = () => {
    updateDraft.mutate({ id: report.id, selfReflection: reflection });
  };

  const handleSubmit = () => {
    if (confirm('Bạn có chắc chắn muốn nộp báo cáo này? Sau khi nộp sẽ không thể chỉnh sửa.')) {
      submitReport.mutate(report.id, { onSuccess: onClose });
    }
  };

  const handleReview = () => {
    if (managerComment.trim().length < 2) {
      toast.error('Nhận xét phải có ít nhất 2 ký tự');
      return;
    }
    if (confirm('Xác nhận hoàn tất duyệt báo cáo này?')) {
      reviewReport.mutate({ id: report.id, managerComment }, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-slate-50 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shrink-0">
          <div>
            <h3 className="font-bold text-lg text-slate-800">
              Báo cáo {t(`impact.reportPeriod.${report.period}`)}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className={`px-2 py-0.5 font-bold uppercase rounded ${
                report.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                report.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-600' :
                'bg-emerald-100 text-emerald-600'
              }`}>
                {t(`impact.reportStatus.${report.status}`)}
              </span>
              <span className="text-slate-500">
                {new Date(report.periodStart).toLocaleDateString()} - {new Date(report.periodEnd).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {isAdmin && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">
                {report.employee.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-800">{report.employee.fullName}</p>
                <p className="text-xs text-slate-500">{report.employee.employeeCode}</p>
              </div>
            </div>
          )}

          {/* Snapshot Summary */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-700 mb-4">Tổng quan trong kỳ</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-2xl font-black text-amber-500">{report.snapshot.entries.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Thành tích</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-2xl font-black text-emerald-500">{report.snapshot.completedIssues.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Issues</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-2xl font-black text-purple-500">{report.snapshot.goals.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Mục tiêu</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-2xl font-black text-blue-500">{report.snapshot.recognitions.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Ghi nhận</p>
              </div>
            </div>
          </div>

          {/* Self Reflection */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-700 mb-2">Tự đánh giá</h4>
            {report.status === 'DRAFT' && !isAdmin ? (
              <textarea 
                value={reflection} 
                onChange={(e) => setReflection(e.target.value)} 
                rows={4} 
                className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                placeholder="Nhập tự đánh giá của bạn..."
              />
            ) : (
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg whitespace-pre-wrap italic">
                {report.selfReflection || "Không có nội dung tự đánh giá."}
              </p>
            )}
          </div>

          {/* Manager Comment */}
          {(report.status === 'SUBMITTED' || report.status === 'REVIEWED') && (
            <div className={`bg-white p-5 rounded-xl shadow-sm border ${isAdmin && report.status === 'SUBMITTED' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}`}>
              <h4 className="font-bold text-slate-700 mb-2">Nhận xét của quản lý</h4>
              {isAdmin && report.status === 'SUBMITTED' ? (
                <textarea 
                  value={managerComment} 
                  onChange={(e) => setManagerComment(e.target.value)} 
                  rows={4} 
                  className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none"
                  placeholder="Nhập nhận xét và đánh giá cho nhân viên..."
                />
              ) : (
                <div className="text-sm text-slate-600 bg-emerald-50 p-4 rounded-lg whitespace-pre-wrap relative">
                  {report.status === 'REVIEWED' && <CheckCircle2 className="absolute top-4 right-4 text-emerald-400 opacity-20" size={40} />}
                  {report.managerComment || "Đang chờ quản lý nhận xét..."}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex justify-end gap-3">
          {report.status === 'DRAFT' && !isAdmin && (
            <>
              <button onClick={handleSaveDraft} disabled={updateDraft.isPending} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                Lưu nháp
              </button>
              <button onClick={handleSubmit} disabled={submitReport.isPending} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-2 transition-all">
                <Send size={16} /> Nộp báo cáo
              </button>
            </>
          )}

          {isAdmin && report.status === 'SUBMITTED' && (
            <button onClick={handleReview} disabled={reviewReport.isPending} className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-2 transition-all">
              <CheckCircle2 size={16} /> Hoàn tất duyệt
            </button>
          )}

          {(report.status === 'REVIEWED' || (isAdmin && report.status !== 'SUBMITTED')) && (
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Đóng
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
