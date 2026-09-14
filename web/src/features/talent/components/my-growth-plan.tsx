// @ts-nocheck
/* eslint-disable */
import { useTranslations } from 'next-intl';
import { useMyGrowthPlan } from '@/features/talent/api';
import { Target, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

export function MyGrowthPlan() {
  const t = useTranslations();
  const { data, isLoading } = useMyGrowthPlan();

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">{t('common.loading')}</div>;
  }

  if (!data || data.gapCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <Target size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Tuyệt vời!</h3>
        <p className="text-slate-500 text-center max-w-md">
          Bạn hiện đã đáp ứng đầy đủ tất cả các yêu cầu kỹ năng cho các dự án và cơ hội hiện tại. 
          Hãy tiếp tục duy trì và tìm kiếm các thách thức mới!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Mục tiêu ưu tiên</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{data.gapCount} <span className="text-sm font-medium text-slate-500">kỹ năng cần cải thiện</span></h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl border border-indigo-400/30 p-6 shadow-lg shadow-indigo-500/20 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
          <h3 className="text-lg font-bold mb-2 relative z-10">Lộ trình phát triển</h3>
          <p className="text-sm text-indigo-100 relative z-10">
            Hệ thống phân tích dựa trên yêu cầu của các dự án và cơ hội bạn đang quan tâm để đề xuất lộ trình tối ưu nhất.
          </p>
        </div>
      </div>

      {/* Priority Gaps List */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100/60 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <Target size={20} className="text-indigo-500" /> Kỹ năng cần tập trung phát triển
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {data.priorityGaps.map((gap: any, index: number) => (
              <div key={index} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-400 to-orange-400" />
                
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800 text-lg">{gap.skill.name}</h4>
                      <span className="text-xs font-semibold text-slate-500 px-2 py-0.5 bg-slate-100 rounded uppercase">{gap.skill.code}</span>
                    </div>
                    {gap.skill.category && (
                      <p className="text-xs text-slate-500 font-medium mb-3">{gap.skill.category}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle size={14} className="text-rose-500" />
                      <span className="text-xs text-slate-600">
                        Nhu cầu từ: <strong className="text-slate-800">{gap.sourceName}</strong> ({gap.sourceType})
                      </span>
                    </div>
                  </div>

                  {/* Level progression visualization */}
                  <div className="w-full md:w-64 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Hiện tại</p>
                        <p className="font-black text-slate-700 text-lg">Lvl {gap.currentLevel}</p>
                      </div>
                      <ArrowRight className="text-indigo-300" />
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">Mục tiêu</p>
                        <p className="font-black text-indigo-600 text-lg">Lvl {gap.targetLevel}</p>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-slate-400 transition-all duration-1000"
                        style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000 animate-pulse"
                        style={{ width: `${((gap.targetLevel - gap.currentLevel) / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
                      Cần tăng thêm <span className="font-bold text-rose-500">{gap.gap}</span> level
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
