'use client';
import { useTranslations } from 'next-intl';
import { DashboardSummary } from '../types';
import { 
  Trophy, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Star, 
  ThumbsUp, 
  FolderKanban
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function ImpactDashboard({ data }: { data: DashboardSummary }) {
  const t = useTranslations();
  const summary = data.summary;

  const kpis = [
    { label: t('impact.title'), value: summary.entryCount, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Nổi bật', value: summary.highlightedCount, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Issue hoàn thành', value: summary.completedIssueCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Issue ưu tiên cao', value: summary.highPriorityIssueCount, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Dự án đóng góp', value: summary.contributedProjectCount, icon: FolderKanban, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Lời ghi nhận', value: summary.recognitionCount, icon: ThumbsUp, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Mục tiêu hoàn thành', value: summary.completedGoalCount, icon: Target, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Giờ làm việc', value: Math.round(summary.workedMinutes / 60), icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50', suffix: 'h' }
  ];

  const typeData = Object.entries(summary.entriesByType).map(([key, value]) => ({
    name: t(`impact.types.${key}`),
    value
  }));

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-black text-slate-800">
                  {kpi.value} {kpi.suffix && <span className="text-sm font-semibold text-slate-400">{kpi.suffix}</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Phân bố thành tích</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {typeData.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Thành tích theo loại</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
