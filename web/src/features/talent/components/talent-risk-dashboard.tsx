// @ts-nocheck
/* eslint-disable */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBusFactor, useEmployeeImpact } from '@/features/talent/api';
import { AlertTriangle, Users, FolderKanban, Target, ChevronRight, Activity } from 'lucide-react';
import { Portal } from '@/components/ui/portal';
import { EmployeeSummary } from '@/types';

export function TalentRiskDashboard() {
  const t = useTranslations();
  
  // Settings for bus factor
  const [maxHolders, setMaxHolders] = useState(1);
  const [minimumLevel, setMinimumLevel] = useState(3);

  const { data: busFactorData, isLoading: isLoadingBusFactor } = useBusFactor({ maxHolders, minimumLevel });

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const { data: impactData, isLoading: isLoadingImpact } = useEmployeeImpact(selectedEmployeeId || '');

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
        <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-amber-900">Phân tích Rủi ro "Bus Factor"</h4>
          <p className="text-sm text-amber-700 mt-1">
            Mô phỏng rủi ro khi một nhân sự chủ chốt nghỉ việc. 
            <span className="font-semibold block mt-1">Lưu ý: Đây là phân tích hỗ trợ quyết định, không dùng làm căn cứ duy nhất cho quyết định nhân sự.</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-slate-500">Kỹ năng rủi ro cao</p>
              <h3 className="text-3xl font-black text-rose-600 mt-1">{busFactorData?.criticalSkillCount || 0}</h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Chỉ có ≤ {maxHolders} người đạt level ≥ {minimumLevel}</p>
        </div>
        
        {/* Settings */}
        <div className="md:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white p-5 shadow-sm flex flex-col justify-center">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Tham số mô phỏng</h4>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Số người nắm giữ tối đa</label>
              <input 
                type="number" min={1} max={5}
                value={maxHolders} onChange={e => setMaxHolders(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Mức level tối thiểu (1-5)</label>
              <input 
                type="number" min={1} max={5}
                value={minimumLevel} onChange={e => setMinimumLevel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Skills Table */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Danh sách kỹ năng rủi ro</h3>
        </div>
        
        {isLoadingBusFactor ? (
          <div className="p-8 text-center text-slate-400">{t('common.loading')}</div>
        ) : busFactorData?.criticalSkills.length === 0 ? (
          <div className="p-8 text-center text-slate-400">Không phát hiện rủi ro với tham số hiện tại.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 font-bold">Kỹ năng</th>
                  <th className="px-6 py-3 font-bold text-center">Người nắm giữ</th>
                  <th className="px-6 py-3 font-bold text-center">Dự án ảnh hưởng</th>
                  <th className="px-6 py-3 font-bold text-center">Cơ hội ảnh hưởng</th>
                  <th className="px-6 py-3 font-bold">Mức độ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {busFactorData?.criticalSkills.map((item, i) => (
                  <tr key={i} className="hover:bg-indigo-50/30">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{item.skill.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{item.skill.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="font-bold text-indigo-600 text-lg">{item.qualifiedHolderCount}</span>
                        <div className="flex -space-x-2">
                          {item.holders.map((h: EmployeeSummary) => (
                            <button
                              key={h.id}
                              onClick={() => setSelectedEmployeeId(h.id)}
                              className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700 hover:z-10 hover:scale-110 transition-transform cursor-pointer"
                              title={`${h.fullName} - Click để xem rủi ro mô phỏng`}
                            >
                              {h.fullName.substring(0,2).toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600">
                        <FolderKanban size={14} /> <span className="font-bold">{item.affectedProjects}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600">
                        <Target size={14} /> <span className="font-bold">{item.affectedOpportunities}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Impact Modal */}
      {selectedEmployeeId && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <h3 className="font-bold text-slate-800">
                  Mô phỏng rủi ro: Nếu nhân sự này nghỉ việc
                </h3>
                <button onClick={() => setSelectedEmployeeId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  X
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {isLoadingImpact ? (
                  <div className="text-center py-10 text-slate-400">{t('common.loading')}</div>
                ) : impactData ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg">
                        {impactData.employee.fullName.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{impactData.employee.fullName}</h4>
                        <p className="text-sm text-slate-500">{impactData.employee.position?.name} • {impactData.employee.department?.name}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Tổng rủi ro</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          impactData.overallRisk === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                          impactData.overallRisk === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {impactData.overallRisk}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <h5 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                          <FolderKanban size={14} className="text-indigo-500"/> Công việc tồn đọng
                        </h5>
                        <p className="text-2xl font-black text-slate-800">{impactData.openIssues}</p>
                        <p className="text-xs text-slate-500 mt-1">Cần bàn giao ngay</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-slate-800 mb-3">Kỹ năng có nguy cơ thiếu hụt</h5>
                      <div className="space-y-3">
                        {impactData.skillRisks.map((sr: any, idx: number) => (
                          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-4">
                            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg shrink-0">
                              <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h6 className="font-bold text-slate-800">{sr.skill.name}</h6>
                                  <p className="text-xs text-slate-500">Người thay thế đủ trình độ: <span className="font-bold text-rose-600">{sr.qualifiedBackups}</span></p>
                                </div>
                              </div>
                              {sr.affectedProjects.length > 0 && (
                                <div className="mt-2 text-[11px] bg-slate-50 p-2 rounded-lg text-slate-600 border border-slate-100">
                                  <span className="font-bold">Ảnh hưởng dự án:</span> {sr.affectedProjects.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-slate-800 mb-3">Hành động đề xuất</h5>
                      <div className="space-y-2">
                        {impactData.recommendedActions.map((actionCode: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                              <ChevronRight size={14} />
                            </div>
                            <span className="text-sm font-semibold text-indigo-900">
                              {t(`talent.recommendedActions.${actionCode}`)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
