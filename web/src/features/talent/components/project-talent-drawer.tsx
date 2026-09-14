// @ts-nocheck
/* eslint-disable */
import { useTranslations } from 'next-intl';
import { X, CheckCircle2, AlertCircle, FolderKanban } from 'lucide-react';
import { useProjectMatches, useProjectEvidenceSuggestions } from '@/features/talent/api';
import { Portal } from '@/components/ui/portal';
import { TalentMatch } from '@/types';

interface ProjectTalentDrawerProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectTalentDrawer({ projectId, isOpen, onClose }: ProjectTalentDrawerProps) {
  const t = useTranslations();
  
  const { data: matchData, isLoading: isLoadingMatches } = useProjectMatches(projectId);
  const { data: evidenceData, isLoading: isLoadingEvidence } = useProjectEvidenceSuggestions(projectId);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity flex justify-end" onClick={onClose}>
        <div 
          className="w-full max-w-xl h-full bg-slate-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">Ứng viên phù hợp dự án</h2>
              <p className="text-sm text-slate-500 mt-1">Dựa trên yêu cầu năng lực</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Matches */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-indigo-500" /> Top ứng viên
              </h4>
              
              {isLoadingMatches ? (
                <p className="text-sm text-slate-500 text-center py-4">{t('common.loading')}</p>
              ) : matchData?.candidates.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Chưa có ứng viên nào đáp ứng yêu cầu.</p>
              ) : (
                <div className="space-y-4">
                  {matchData?.candidates.map((cand: TalentMatch, idx: number) => (
                    <div key={cand.employee.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 bg-indigo-50 text-indigo-700 font-black rounded-bl-xl border-b border-l border-indigo-100">
                        {Math.round(cand.matchScore)}%
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 pr-12">
                          <h5 className="font-bold text-slate-800 text-lg">{cand.employee.fullName}</h5>
                          <p className="text-[11px] text-slate-500 mb-2">{cand.employee.position?.name} • {cand.employee.department?.name}</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 mb-3">
                            <div className="bg-white px-2 py-1.5 rounded border border-slate-100">
                              Kỹ năng: <span className="text-indigo-600">{Math.round(cand.skillFitScore)}/100</span>
                            </div>
                            <div className="bg-white px-2 py-1.5 rounded border border-slate-100">
                              Khả dụng: <span className="text-indigo-600">{Math.round(cand.availabilityScore)}/100</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-4 text-[10px] text-slate-500 mt-2 border-t border-slate-200/60 pt-2">
                            <span>Open Issues: <strong className="text-rose-500">{cand.workload.openIssueCount}</strong></span>
                            <span>OT (30 ngày): <strong>{Math.round(cand.workload.overtimeMinutes30Days / 60)}h</strong></span>
                          </div>

                          {cand.missingRequiredSkills.length > 0 && (
                            <div className="mt-3 p-2 bg-rose-50/50 rounded border border-rose-100">
                              <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mb-1">
                                <AlertCircle size={12} /> Thiếu kỹ năng bắt buộc:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {cand.missingRequiredSkills.map((missing: any) => (
                                  <span key={missing.skillId} className="px-1.5 py-0.5 bg-white text-rose-600 text-[9px] rounded border border-rose-100">
                                    {missing.name || missing.code}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evidence Suggestions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FolderKanban size={18} className="text-emerald-500" /> Gợi ý cập nhật năng lực
              </h4>
              <p className="text-[11px] text-slate-500 mb-4">
                Dựa trên issue đã hoàn thành trong dự án, hệ thống gợi ý xác nhận năng lực (Bằng chứng dự án).
              </p>
              
              {isLoadingEvidence ? (
                <p className="text-sm text-slate-500 text-center py-4">{t('common.loading')}</p>
              ) : evidenceData?.suggestions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Chưa có gợi ý nào từ dự án này.</p>
              ) : (
                <div className="space-y-4">
                  {evidenceData?.suggestions.map((sug: any, idx: number) => (
                    <div key={idx} className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100">
                      <p className="font-bold text-slate-800 text-sm mb-1">{sug.employee.fullName}</p>
                      <p className="text-xs text-slate-500 mb-2">Đã đóng {sug.completedIssueCount} issue trong dự án</p>
                      
                      <div className="space-y-2">
                        {sug.suggestedSkills.map((sksug: any, sIdx: number) => (
                          <div key={sIdx} className="bg-white p-2 rounded-lg border border-emerald-100/50 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-emerald-800">{sksug.skill.name} (Lvl {sksug.suggestedLevel})</p>
                              <p className="text-[10px] text-slate-500 italic mt-0.5">"{sksug.evidence}"</p>
                            </div>
                            <button 
                              className="px-2 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded text-[10px] font-bold transition-colors shrink-0"
                              onClick={() => {
                                alert('Chức năng duyệt bằng chứng đang được phát triển.');
                              }}
                            >
                              Xác nhận
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </Portal>
  );
}
