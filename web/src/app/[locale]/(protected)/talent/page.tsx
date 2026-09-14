// @ts-nocheck
/* eslint-disable */
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Target, AlertTriangle, Users, FolderKanban, ShieldCheck, Activity, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/features/auth/auth-context';
import { TalentRiskDashboard } from '@/features/talent/components/talent-risk-dashboard';
import { SkillsCatalog } from '@/features/talent/components/skills-catalog';
import { OpportunitiesList } from '@/features/talent/components/opportunities-list';
import { MySkillsView } from '@/features/talent/components/my-skills-view';
import { MyGrowthPlan } from '@/features/talent/components/my-growth-plan';
// Assume MyApplications is part of OpportunitiesList or a separate component (omitted for brevity, can be a tab inside opportunities for EMPLOYEE)

export default function TalentPage() {
  const t = useTranslations();
  const { user, loading } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Tabs logic
  const [activeTab, setActiveTab] = useState(isAdmin ? 'riskDashboard' : 'mySkills');

  if (loading || !user) return null;
  
  if (user.role === 'SUPER_ADMIN') {
    return <div className="p-8 text-center">Not available for SUPER_ADMIN</div>;
  }

  const adminTabs = [
    { id: 'riskDashboard', label: t('talent.tabs.riskDashboard'), icon: AlertTriangle },
    { id: 'skills', label: t('talent.tabs.skills'), icon: BrainCircuit },
    { id: 'opportunities', label: t('talent.tabs.opportunities'), icon: Target },
  ];

  const employeeTabs = [
    { id: 'mySkills', label: t('talent.tabs.mySkills'), icon: ShieldCheck },
    { id: 'myGrowthPlan', label: t('talent.tabs.myGrowthPlan'), icon: Activity },
    { id: 'opportunities', label: t('talent.tabs.opportunities'), icon: Target },
  ];

  const tabs = isAdmin ? adminTabs : employeeTabs;

  const renderContent = () => {
    switch (activeTab) {
      case 'riskDashboard': return <TalentRiskDashboard />;
      case 'skills': return <SkillsCatalog />;
      case 'mySkills': return <MySkillsView />;
      case 'myGrowthPlan': return <MyGrowthPlan />;
      case 'opportunities': return <OpportunitiesList />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/50 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Target size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight title-gradient">
              {t('talent.title')}
            </h1>
            <p className="text-sm font-medium text-slate-500">{t('talent.description')}</p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="px-6 pt-4">
        <div className="flex gap-2 p-1 bg-white/60 backdrop-blur-md rounded-xl border border-white/60 shadow-sm w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
