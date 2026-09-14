'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/features/auth/auth-context';
import { useImpactDashboard } from './api';
import { ImpactDashboard } from './components/impact-dashboard';
import { ImpactTimeline } from './components/impact-timeline';
import { ImpactSuggestions } from './components/impact-suggestions';
import { ImpactGoals } from './components/impact-goals';
import { ImpactRecognitions } from './components/impact-recognitions';
import { ImpactReports } from './components/impact-reports';
import { Trophy, LayoutDashboard, Clock, Lightbulb, Target, MessageSquare, FileText } from 'lucide-react';

export function EmployeeImpactView() {
  const t = useTranslations();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: dashboardData, isLoading } = useImpactDashboard();

  const tabs = [
    { id: 'overview', icon: LayoutDashboard, label: t('impact.tabs.overview') },
    { id: 'timeline', icon: Clock, label: t('impact.tabs.timeline') },
    { id: 'suggestions', icon: Lightbulb, label: t('impact.tabs.suggestions') },
    { id: 'goals', icon: Target, label: t('impact.tabs.goals') },
    { id: 'recognitions', icon: MessageSquare, label: t('impact.tabs.recognitions') },
    { id: 'reports', icon: FileText, label: t('impact.tabs.reports') }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="bg-white px-6 pt-6 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
            <Trophy size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('impact.title')}</h1>
            <p className="text-sm font-medium text-slate-500">
              Ghi nhận và đo lường giá trị bạn mang lại cho {user?.company?.name || 'công ty'}
            </p>
          </div>
        </div>

        <div className="flex overflow-x-auto hide-scrollbar gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 flex items-center gap-2 font-bold text-sm transition-all whitespace-nowrap border-b-2 ${
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
          {activeTab === 'overview' && (
            isLoading ? (
              <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-40 bg-slate-200 rounded"></div></div></div>
            ) : dashboardData ? (
              <ImpactDashboard data={dashboardData} />
            ) : null
          )}
          
          {activeTab === 'timeline' && <ImpactTimeline />}
          {activeTab === 'suggestions' && <ImpactSuggestions />}
          {activeTab === 'goals' && <ImpactGoals />}
          {activeTab === 'recognitions' && <ImpactRecognitions />}
          {activeTab === 'reports' && <ImpactReports />}
        </div>
      </div>
    </div>
  );
}
