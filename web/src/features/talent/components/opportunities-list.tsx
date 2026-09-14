// @ts-nocheck
/* eslint-disable */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Plus, Calendar, Users, Briefcase, ChevronRight } from 'lucide-react';
import { useTalentOpportunities } from '@/features/talent/api';
import { useAuth } from '@/features/auth/auth-context';
import { OpportunityDetailDrawer } from './opportunity-detail-drawer';
import { OpportunityForm } from './opportunity-form';
import { TalentOpportunity } from '@/types';

export function OpportunitiesList() {
  const t = useTranslations();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  
  // EMPLOYEE only sees OPEN. ADMIN can filter by status, default to all.
  const [status, setStatus] = useState(isAdmin ? '' : 'OPEN');

  const { data: opportunitiesData, isLoading } = useTalentOpportunities({
    page,
    pageSize: 12,
    search: debouncedSearch,
    type: type || undefined,
    status: status || undefined
  });

  const [selectedOp, setSelectedOp] = useState<TalentOpportunity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    const handler = setTimeout(() => setDebouncedSearch(e.target.value), 500);
    return () => clearTimeout(handler);
  };

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm">
        <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả loại hình</option>
            <option value="PROJECT_ROLE">{t('talent.opportunityType.PROJECT_ROLE')}</option>
            <option value="INTERNAL_POSITION">{t('talent.opportunityType.INTERNAL_POSITION')}</option>
            <option value="SHORT_TERM_MISSION">{t('talent.opportunityType.SHORT_TERM_MISSION')}</option>
          </select>
          {isAdmin && (
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 bg-white/80 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">{t('talent.opportunityStatus.DRAFT')}</option>
              <option value="OPEN">{t('talent.opportunityStatus.OPEN')}</option>
              <option value="CLOSED">{t('talent.opportunityStatus.CLOSED')}</option>
              <option value="CANCELLED">{t('talent.opportunityStatus.CANCELLED')}</option>
            </select>
          )}
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-200"
          >
            <Plus size={16} /> Tạo cơ hội mới
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">{t('common.loading')}</div>
      ) : opportunitiesData?.data.length === 0 ? (
        <div className="p-12 bg-white/40 rounded-2xl border border-dashed border-slate-300 text-center">
          <p className="text-slate-500 font-medium">Không tìm thấy cơ hội nào phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunitiesData?.data.map((op) => (
            <div 
              key={op.id} 
              onClick={() => setSelectedOp(op)}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-white p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wide">
                    {t(`talent.opportunityType.${op.type}`)}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    op.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    op.status === 'DRAFT' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                    'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {t(`talent.opportunityStatus.${op.status}`)}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                  {op.title}
                </h3>
                
                {op.project && (
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-3">
                    <Briefcase size={12} /> {op.project.name}
                  </p>
                )}
                
                {op.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{op.description}</p>
                )}
              </div>
              
              <div className="relative z-10 mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span>{op.openings} vị trí</span>
                </div>
                {op.startDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{new Date(op.startDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {selectedOp && (
        <OpportunityDetailDrawer 
          opportunity={selectedOp} 
          isOpen={!!selectedOp} 
          onClose={() => setSelectedOp(null)} 
          isAdmin={isAdmin}
        />
      )}

      {/* Form */}
      {isFormOpen && (
        <OpportunityForm 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
