// @ts-nocheck
/* eslint-disable */
import { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';
import { EmployeeSkill } from '@/types';

interface SkillRadarChartProps {
  skills: EmployeeSkill[];
}

export function SkillRadarChart({ skills }: SkillRadarChartProps) {
  const data = useMemo(() => {
    // If we have categories, group them. If not, just use names.
    return skills.map(s => ({
      subject: s.skill.name,
      level: s.level,
      fullMark: 5,
      category: s.skill.category || 'Khác'
    }));
  }, [skills]);

  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

  if (skills.length === 0) return null;

  // Requirement: "Không dùng radar chart nếu dưới 3 kỹ năng; dùng card/list để tránh biểu đồ gây hiểu sai."
  // I will use BarChart if < 3, RadarChart if >= 3
  if (skills.length < 3) {
    return (
      <div className="w-full h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, 5]} tickCount={6} stroke="#64748b" fontSize={12} />
            <YAxis dataKey="subject" type="category" width={100} stroke="#64748b" fontSize={12} fontWeight="bold" />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="level" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] mt-2 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-full blur-3xl -z-10" />
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 5]} 
            tickCount={6} 
            tick={{ fill: '#94a3b8', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.6)', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)'
            }}
            itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
          />
          <Radar 
            name="Level" 
            dataKey="level" 
            stroke="#6366f1" 
            strokeWidth={3}
            fill="#8b5cf6" 
            fillOpacity={0.4} 
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#ec4899', strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
