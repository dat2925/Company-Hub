'use client';
import { useState } from 'react';
import { useImpactSuggestions } from '../api';
import { ImpactSuggestion } from '../types';
import { ImpactEntryForm } from './impact-entry-form';
import { Lightbulb, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export function ImpactSuggestions() {
  const { data, isLoading } = useImpactSuggestions();
  const [selectedSuggestion, setSelectedSuggestion] = useState<ImpactSuggestion | null>(null);

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>)}
    </div>;
  }

  const suggestions = data || [];

  if (suggestions.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl">
        <Lightbulb size={40} className="mx-auto text-amber-200 mb-3" />
        <p className="font-bold text-slate-500">Không có gợi ý mới</p>
        <p className="text-sm text-slate-400 mt-1">Các công việc bạn vừa hoàn thành sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-amber-500" size={20} />
        <h3 className="font-bold text-slate-800 text-lg">Gợi ý từ công việc hoàn thành</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-100/50 rounded-full blur-xl group-hover:bg-amber-200/50 transition-colors"></div>
            
            <div className="flex items-start justify-between mb-3 relative z-10">
              <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-white border border-slate-100 text-slate-600 flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 size={12} className="text-emerald-500" /> Issue
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Cập nhật: {new Date(suggestion.completedAtApproximation).toLocaleDateString()}
              </span>
            </div>

            <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 relative z-10" title={suggestion.title}>
              {suggestion.title}
            </h4>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Dự án: {suggestion.project.code}</span>
              {suggestion.priority === 'HIGH' || suggestion.priority === 'URGENT' ? (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle size={10} /> Ưu tiên cao
                </span>
              ) : null}
            </div>

            <button 
              onClick={() => setSelectedSuggestion(suggestion)}
              className="w-full py-2 bg-white hover:bg-amber-50 border border-amber-200 text-amber-600 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 relative z-10"
            >
              Thêm vào thành tích <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {selectedSuggestion && (
        <ImpactEntryForm 
          onClose={() => setSelectedSuggestion(null)}
          prefill={{
            title: `Hoàn thành: ${selectedSuggestion.title}`,
            type: 'DELIVERY',
            occurredOn: selectedSuggestion.completedAtApproximation.split('T')[0],
            projectId: selectedSuggestion.projectId,
            sourceIssueId: selectedSuggestion.sourceIssueId
          }}
        />
      )}
    </div>
  );
}
