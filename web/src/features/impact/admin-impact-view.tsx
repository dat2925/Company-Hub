'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { useImpactDashboard } from './api';
import { ImpactDashboard } from './components/impact-dashboard';
import { ImpactTimeline } from './components/impact-timeline';
import { ImpactGoals } from './components/impact-goals';
import { ImpactReports } from './components/impact-reports';
import { Trophy, LayoutDashboard, Target, FileText, Search, Users } from 'lucide-react';

export function AdminImpactView() {
  const t = useTranslations();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: employees } = useQuery({
    queryKey: ['employees-options'],
    queryFn: () => api.get<Record<string, unknown>[]>('/employees/options/list').then(res => res.data as {id: string, fullName: string, employeeCode: string}[])
  });

  const { data: dashboardData, isLoading: isDashboardLoading } = useImpactDashboard({ 
    employeeId: selectedEmployeeId 
  });

  const tabs = [
    { id: 'overview', icon: LayoutDashboard, label: t('impact.tabs.overview') },
    { id: 'timeline', icon: Trophy, label: t('impact.tabs.timeline') },
    { id: 'goals', icon: Target, label: t('impact.tabs.goals') },
    { id: 'reports', icon: FileText, label: t('impact.tabs.pendingReports') }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="bg-white px-6 pt-6 border-b border-slate-200 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('impact.adminTitle')}</h1>
              <p className="text-sm font-medium text-slate-500">
                Quản lý thành tích và mục tiêu của đội ngũ
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none"
            >
              <option value="">Tất cả nhân viên (Chỉ xem báo cáo)</option>
              {employees?.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeCode})</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            // Disable employee-specific tabs if no employee is selected
            const disabled = !selectedEmployeeId && (tab.id === 'overview' || tab.id === 'goals' || tab.id === 'timeline');

            return (
              <button
                key={tab.id}
                onClick={() => !disabled && setActiveTab(tab.id)}
                disabled={disabled}
                className={`pb-3 flex items-center gap-2 font-bold text-sm transition-all whitespace-nowrap border-b-2 ${
                  disabled ? 'opacity-50 cursor-not-allowed border-transparent text-slate-400' :
                  isActive 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {!selectedEmployeeId && activeTab !== 'reports' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users size={64} className="text-slate-200 mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">Vui lòng chọn nhân viên</h2>
              <p className="text-slate-500 max-w-md">Chọn một nhân viên từ danh sách phía trên để xem chi tiết bảng tin thành tích, mục tiêu và dòng thời gian của họ.</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                isDashboardLoading ? (
                  <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-40 bg-slate-200 rounded"></div></div></div>
                ) : dashboardData ? (
                  <ImpactDashboard data={dashboardData} />
                ) : null
              )}
              
              {activeTab === 'timeline' && <ImpactTimeline employeeId={selectedEmployeeId} readOnly />}
              {activeTab === 'goals' && <ImpactGoals employeeId={selectedEmployeeId} />}
              {activeTab === 'reports' && <ImpactReports employeeId={selectedEmployeeId || undefined} isAdmin />}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
