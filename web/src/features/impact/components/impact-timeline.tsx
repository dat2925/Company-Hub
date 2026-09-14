'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useImpactEntries, useDeleteImpactEntry } from '../api';
import { ImpactEntry } from '../types';
import { ImpactEntryForm } from './impact-entry-form';
import { Trophy, Plus, Star, Edit2, Trash2, Shield } from 'lucide-react';

export function ImpactTimeline({ employeeId, readOnly = false }: { employeeId?: string; readOnly?: boolean }) {
  const t = useTranslations();
  const [page] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ImpactEntry | null>(null);
  
  const { data, isLoading } = useImpactEntries({ page, pageSize: 10, employeeId });
  const deleteMutation = useDeleteImpactEntry();

  const handleEdit = (entry: ImpactEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('common.deleteConfirm'))) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>)}
    </div>;
  }

  const entries = data || [];

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Dòng thời gian</h3>
            <p className="text-xs text-slate-500">Các thành tích và đóng góp nổi bật của bạn</p>
          </div>
          <button 
            onClick={() => { setEditingEntry(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            <Plus size={16} /> Thêm thành tích
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-100 rounded-2xl border-dashed">
          <Trophy size={48} className="mx-auto text-slate-200 mb-3" />
          <p className="font-bold text-slate-500">Chưa có thành tích nào</p>
          {!readOnly && (
            <button onClick={() => setShowForm(true)} className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-700">
              Ghi nhận thành tích đầu tiên ngay
            </button>
          )}
        </div>
      ) : (
        <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-8">
          {entries.map((entry) => (
            <div key={entry.id} className="relative pl-8 group">
              <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white ${entry.isHighlighted ? 'bg-amber-400' : 'bg-indigo-400'} shadow-sm`}></div>
              
              <div className={`bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${entry.isHighlighted ? 'border-amber-200 bg-gradient-to-br from-amber-50/30 to-white' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                      {t(`impact.types.${entry.type}`)}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(entry.occurredOn).toLocaleDateString()}
                    </span>
                    {entry.isHighlighted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                        <Star size={10} /> Nổi bật
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500" title="Quyền riêng tư">
                      <Shield size={12} /> {t(`impact.visibility.${entry.visibility}`)}
                    </span>
                  </div>
                  
                  {!readOnly && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(entry)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-slate-800 text-base mb-1.5 leading-snug">{entry.title}</h4>
                {entry.description && <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{entry.description}</p>}
                
                {entry.metrics && Object.keys(entry.metrics).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100/60">
                    {Object.entries(entry.metrics).map(([key, val]) => (
                      <div key={key} className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{key}</span>
                        <span className="text-xs font-black text-indigo-600">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {(entry.project || entry.sourceIssue) && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100/60 text-xs">
                    {entry.project && (
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">Dự án: {entry.project.code}</span>
                    )}
                    {entry.sourceIssue && (
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">Issue: {entry.sourceIssue.title}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ImpactEntryForm 
          entry={editingEntry} 
          onClose={() => { setShowForm(false); setEditingEntry(null); }} 
        />
      )}
    </div>
  );
}
