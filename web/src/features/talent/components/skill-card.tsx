// @ts-nocheck
/* eslint-disable */
import { useTranslations } from 'next-intl';
import { Award, Briefcase, Calendar, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { EmployeeSkill } from '@/types';

interface SkillCardProps {
  employeeSkill: EmployeeSkill;
  onEdit?: (skill: EmployeeSkill) => void;
  onDelete?: (skill: EmployeeSkill) => void;
}

export function SkillCard({ employeeSkill, onEdit, onDelete }: SkillCardProps) {
  const t = useTranslations();
  const { skill, level, yearsExperience, source, evidence, lastUsedAt, verifiedAt } = employeeSkill;

  // Level representation
  const levelLabels = {
    1: 'Cơ bản',
    2: 'Sơ cấp',
    3: 'Thành thạo',
    4: 'Nâng cao',
    5: 'Chuyên gia'
  };

  const getSourceIcon = () => {
    switch (source) {
      case 'SELF_DECLARED': return <User size={14} />;
      case 'MANAGER_VERIFIED': return <ShieldCheck size={14} className="text-emerald-500" />;
      case 'PROJECT_EVIDENCE': return <Briefcase size={14} className="text-indigo-500" />;
      case 'CERTIFICATION': return <Award size={14} className="text-amber-500" />;
      default: return <User size={14} />;
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800">{skill.name}</h4>
              {verifiedAt && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title="Đã xác minh">
                  <CheckCircle2 size={10} /> Verified
                </span>
              )}
            </div>
            {skill.category && (
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{skill.category}</span>
            )}
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button onClick={() => onEdit(employeeSkill)} className="text-slate-400 hover:text-indigo-600 p-1 bg-white rounded-md shadow-xs border border-slate-100">
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {/* Level Progress */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-indigo-600">Level {level}: {levelLabels[level as keyof typeof levelLabels]}</span>
              <span className="text-slate-500">{yearsExperience} năm K/N</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 flex gap-0.5">
              {[1, 2, 3, 4, 5].map(l => (
                <div 
                  key={l} 
                  className={`h-full flex-1 first:rounded-l-full last:rounded-r-full ${
                    l <= level 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                      : 'bg-transparent'
                  }`} 
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-[11px] mt-2 pt-2 border-t border-slate-100/60">
            <div className="flex items-center gap-1.5 text-slate-600">
              {getSourceIcon()}
              <span>{t(`talent.skillSource.${source}`)}</span>
            </div>
            {lastUsedAt && (
              <div className="flex items-center gap-1.5 text-slate-600 justify-end">
                <Calendar size={12} className="text-slate-400" />
                <span>Dùng: {new Date(lastUsedAt).getFullYear()}</span>
              </div>
            )}
          </div>
          
          {evidence && (
            <div className="mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100/50">
              <p className="text-[10px] text-slate-500 italic line-clamp-2">"{evidence}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
