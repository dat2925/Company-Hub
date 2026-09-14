// @ts-nocheck
/* eslint-disable */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, Calendar, Users, Briefcase, CheckCircle2, AlertCircle, Send, Check } from 'lucide-react';
import { 
  useMyOpportunityMatch, 
  useApplyOpportunity,
  useOpportunityMatches,
  useOpportunityApplications,
  useUpdateApplicationStatus
} from '@/features/talent/api';
import { TalentOpportunity } from '@/types';
import { Portal } from '@/components/ui/portal';
import { toast } from 'sonner';

interface OpportunityDetailDrawerProps {
  opportunity: TalentOpportunity;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export function OpportunityDetailDrawer({ opportunity, isOpen, onClose, isAdmin }: OpportunityDetailDrawerProps) {
  const t = useTranslations();
  const [message, setMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // EMPLOYEE fetch their match
  const { data: myMatchData, isLoading: isLoadingMyMatch } = useMyOpportunityMatch(isAdmin ? '' : opportunity.id);
  const applyMutation = useApplyOpportunity();

  // ADMIN fetch all matches and applications
  const { data: matchesData } = useOpportunityMatches(isAdmin ? opportunity.id : '');
  const { data: applicationsData } = useOpportunityApplications(isAdmin ? opportunity.id : '');
  const updateAppStatusMutation = useUpdateApplicationStatus();

  if (!isOpen) return null;

  const handleApply = () => {
    applyMutation.mutate(
      { opportunityId: opportunity.id, message },
      { onSuccess: () => { setIsApplying(false); onClose(); } }
    );
  };

  const handleUpdateAppStatus = (applicationId: string, status: string) => {
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      if (!confirm(`Bạn có chắc muốn chuyển trạng thái thành ${t(`talent.applicationStatus.${status}`)}?`)) return;
    }
    updateAppStatusMutation.mutate({ opportunityId: opportunity.id, applicationId, status });
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity flex justify-end" onClick={onClose}>
        <div 
          className="w-full max-w-xl h-full bg-slate-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wide">
                  {t(`talent.opportunityType.${opportunity.type}`)}
                </span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  opportunity.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  opportunity.status === 'DRAFT' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                  'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                  {t(`talent.opportunityStatus.${opportunity.status}`)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">{opportunity.title}</h2>
              {opportunity.project && (
                <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <Briefcase size={14} /> {opportunity.project.name}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Details */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">Thông tin chi tiết</h4>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{opportunity.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Users size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Số lượng</p>
                    <p className="font-medium">{opportunity.openings} vị trí</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Calendar size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Thời gian</p>
                    <p className="font-medium">
                      {opportunity.startDate ? new Date(opportunity.startDate).toLocaleDateString() : 'N/A'} - {opportunity.endDate ? new Date(opportunity.endDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3">Yêu cầu kỹ năng</h4>
              {opportunity.requirements.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Chưa có yêu cầu cụ thể.</p>
              ) : (
                <div className="space-y-3">
                  {opportunity.requirements.map(req => (
                    <div key={req.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{req.skill.name}</p>
                        <p className="text-[10px] text-slate-500">Mức tối thiểu: Lvl {req.minimumLevel}</p>
                      </div>
                      {req.isRequired && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded uppercase">Bắt buộc</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EMPLOYEE View: Match Analysis & Apply */}
            {!isAdmin && opportunity.status === 'OPEN' && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-indigo-600" /> Độ phù hợp cá nhân
                </h4>
                
                {isLoadingMyMatch ? (
                  <p className="text-sm text-slate-500">Đang phân tích độ phù hợp...</p>
                ) : myMatchData ? (
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full border-4 border-indigo-200 flex items-center justify-center shrink-0">
                        <span className="text-xl font-black text-indigo-600">{Math.round(myMatchData.match.matchScore)}%</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          Bạn {myMatchData.match.meetsAllRequiredSkills ? 'đáp ứng đầy đủ' : 'chưa đáp ứng đủ'} các kỹ năng bắt buộc.
                        </p>
                        <div className="flex gap-4 text-[11px] text-slate-500 font-semibold">
                          <span>Kỹ năng: <strong className="text-indigo-600">{Math.round(myMatchData.match.skillFitScore)}/100</strong></span>
                          <span>Khả dụng: <strong className="text-indigo-600">{Math.round(myMatchData.match.availabilityScore)}/100</strong></span>
                        </div>
                      </div>
                    </div>

                    {myMatchData.match.missingRequiredSkills.length > 0 && (
                      <div className="mb-4 p-3 bg-white/60 rounded-xl border border-rose-100">
                        <p className="text-xs font-bold text-rose-600 mb-2 flex items-center gap-1.5"><AlertCircle size={14}/> Kỹ năng còn thiếu:</p>
                        <ul className="list-disc pl-5 text-[11px] text-slate-600 space-y-1">
                          {myMatchData.match.missingRequiredSkills.map((missing: any) => (
                            <li key={missing.skillId}>
                              {missing.name} (hiện có lvl {missing.currentLevel}, yêu cầu lvl {missing.requiredLevel})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!isApplying ? (
                      <button 
                        onClick={() => setIsApplying(true)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-colors"
                      >
                        Ứng tuyển ngay
                      </button>
                    ) : (
                      <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                        <label className="block text-xs font-bold text-slate-700">Lời nhắn (Tùy chọn)</label>
                        <textarea 
                          value={message} onChange={e => setMessage(e.target.value)}
                          placeholder="Chia sẻ lý do bạn phù hợp..."
                          rows={3} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setIsApplying(false)} className="px-4 py-2 text-slate-500 text-sm font-medium hover:bg-slate-100 rounded-lg">Hủy</button>
                          <button 
                            onClick={handleApply}
                            disabled={applyMutation.isPending}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                          >
                            <Send size={14} /> Gửi đơn
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Không thể phân tích dữ liệu.</p>
                )}
              </div>
            )}

            {/* ADMIN View: Applications List */}
            {isAdmin && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-3">Đơn ứng tuyển ({applicationsData?.length || 0})</h4>
                <div className="space-y-3">
                  {applicationsData?.map(app => (
                    <div key={app.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-800">{app.employee?.fullName}</p>
                          <p className="text-[11px] text-slate-500">{app.employee?.position?.name} • {app.employee?.department?.name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase border ${
                          app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          app.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          app.status === 'SHORTLISTED' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          app.status === 'WITHDRAWN' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {t(`talent.applicationStatus.${app.status}`)}
                        </span>
                      </div>
                      {app.message && <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 mb-3 italic">"{app.message}"</p>}
                      
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                        {app.status === 'PENDING' && (
                          <button onClick={() => handleUpdateAppStatus(app.id, 'SHORTLISTED')} className="flex-1 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100">Sơ loại</button>
                        )}
                        {(app.status === 'PENDING' || app.status === 'SHORTLISTED') && (
                          <>
                            <button onClick={() => handleUpdateAppStatus(app.id, 'ACCEPTED')} className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100">Chấp nhận</button>
                            <button onClick={() => handleUpdateAppStatus(app.id, 'REJECTED')} className="flex-1 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100">Từ chối</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* ADMIN View: Match Ranking */}
            {isAdmin && matchesData?.candidates && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-3">Ứng viên phù hợp</h4>
                <div className="space-y-3">
                  {matchesData.candidates.map((cand, idx) => (
                    <div key={cand.employee.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 text-sm">{cand.employee.fullName}</p>
                        <p className="text-[10px] text-slate-500">Phù hợp: {Math.round(cand.matchScore)}%</p>
                      </div>
                      {cand.meetsAllRequiredSkills && (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
