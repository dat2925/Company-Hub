'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  Clock4,
  Coffee,
  Frown,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Search
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import {
  useAttendanceList,
  useAttendanceSummary,
  useCheckIn,
  useCheckOut,
  useSaveAttendance,
  useDeleteAttendance,
  Attendance
} from '@/features/attendance/api';
import { api } from '@/lib/api/client';

export default function AttendancePage() {
  const t = useTranslations();
  const { user } = useAuth();
  
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [employeeId, setEmployeeId] = useState<string>('');
  
  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';
  
  const currentEmployeeId = isAdmin && employeeId ? employeeId : undefined;

  const { data: summaryData, isLoading: loadingSummary } = useAttendanceSummary(month, currentEmployeeId);
  const { data: listData, isLoading: loadingList } = useAttendanceList({ page: 1, pageSize: 100, month, employeeId: currentEmployeeId });
  
  const { mutate: checkIn, isPending: checkingIn } = useCheckIn();
  const { mutate: checkOut, isPending: checkingOut } = useCheckOut();
  
  const { data: employeeOptions } = useQuery({
    queryKey: ['employees', 'options'],
    queryFn: () => api.get<{ id: string; fullName: string; employeeCode: string }[]>('/employees/options/list'),
    enabled: isAdmin
  });

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = listData?.data.find(r => r.workDate === today);
  
  const [mode, setMode] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  
  const saveRecord = useSaveAttendance();
  const deleteRecord = useDeleteAttendance();

  const handleCheckInOut = () => {
    if (!todayRecord) {
      checkIn({});
    } else if (!todayRecord.checkOut) {
      checkOut({});
    }
  };

  const formatMinutes = (mins: number) => {
    if (!mins) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return `${h}h ${m}m`;
  };

  const renderStatus = (status: string) => {
    return <span className={`badge badge-${status.toLowerCase()}`}>{t(`statuses.${status}`)}</span>;
  };

  const summary = summaryData?.data;

  return (
    <section className="space-y-8 py-4 perspective-2000 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 stagger-item delay-100">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight title-gradient flex items-center gap-4">
            <CalendarCheck size={40} className="text-indigo-600" />
            {t('attendance.title')}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl text-sm sm:text-base">
            {t('attendance.description')}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <select
                className="input pl-9 pr-10 py-2 text-sm font-semibold rounded-xl"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
              >
                <option value="">-- {t('common.select')} Employee --</option>
                {employeeOptions?.data?.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.fullName}</option>
                ))}
              </select>
            </div>
          )}
          <input
            type="month"
            className="input py-2 text-sm font-semibold rounded-xl"
            value={month}
            onChange={e => setMonth(e.target.value)}
          />
          {isAdmin && (
            <button className="btn btn-primary rounded-xl px-5 py-2 shadow-lg" onClick={() => setMode('create')}>
              <Plus size={18} /> {t('common.actions.create')}
            </button>
          )}
        </div>
      </div>

      {isEmployee && (
        <div className="stagger-item delay-200 card p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] border border-indigo-500/30 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight">{t('attendance.todayStatus')}</h2>
              <p className="text-indigo-200 mt-2 font-medium">
                {todayRecord ? (
                  todayRecord.checkOut 
                    ? `Checked in at ${new Date(todayRecord.checkIn!).toLocaleTimeString()} and out at ${new Date(todayRecord.checkOut).toLocaleTimeString()}`
                    : `Checked in at ${new Date(todayRecord.checkIn!).toLocaleTimeString()}`
                ) : (
                  'You have not checked in today'
                )}
              </p>
            </div>
            <button
              onClick={handleCheckInOut}
              disabled={!!(todayRecord && todayRecord.checkOut) || checkingIn || checkingOut}
              className={`px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl disabled:opacity-50 ${
                !todayRecord 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-105 hover:shadow-emerald-500/50'
                  : !todayRecord.checkOut
                  ? 'bg-amber-500 hover:bg-amber-400 text-white hover:scale-105 hover:shadow-amber-500/50'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {!todayRecord 
                ? t('attendance.checkIn') 
                : !todayRecord.checkOut 
                ? t('attendance.checkOut') 
                : 'Completed'}
            </button>
          </div>
        </div>
      )}

      {summary && (
        <div className="stagger-item delay-300 grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard title={t('attendance.totalHours')} value={formatMinutes(summary.workedMinutes)} icon={Clock} color="indigo" />
          <StatCard title={t('attendance.overtime')} value={formatMinutes(summary.overtimeMinutes)} icon={Clock4} color="amber" />
          <StatCard title={t('attendance.presentDays')} value={summary.byStatus['PRESENT'] || 0} icon={CheckCircle2} color="emerald" />
          <StatCard title={t('attendance.lateDays')} value={summary.byStatus['LATE'] || 0} icon={Frown} color="rose" />
        </div>
      )}

      <div className="stagger-item delay-400 card bg-white/80 backdrop-blur-2xl shadow-xl border border-white/90 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70">
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.workDate')}</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.employeeCode')}</th>}
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.checkIn')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.checkOut')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.status')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.workedMinutes')}</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase text-right">{t('common.actions.title')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listData?.data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{row.workDate}</td>
                  {isAdmin && <td className="px-6 py-4 font-bold text-slate-600">{row.employee?.fullName}</td>}
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-6 py-4">{renderStatus(row.status)}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{formatMinutes(row.workedMinutes)}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl transition-all" onClick={() => { setSelectedRecord(row); setMode('edit'); }}>
                        <Pencil size={16} />
                      </button>
                      <button className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition-all" onClick={() => { setSelectedRecord(row); setMode('delete'); }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {listData?.data.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-slate-400 font-bold">
                    {t('common.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mode && isAdmin && (
        <AdminModal 
          mode={mode} 
          record={selectedRecord}
          onClose={() => { setMode(null); setSelectedRecord(null); }}
          onSave={(data) => { saveRecord.mutate(data); setMode(null); }}
          onDelete={() => { if(selectedRecord) deleteRecord.mutate(selectedRecord.id); setMode(null); }}
          isSaving={saveRecord.isPending}
          isDeleting={deleteRecord.isPending}
          t={t}
          employeeOptions={employeeOptions?.data || []}
        />
      )}
    </section>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: React.ElementType, color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 shadow-indigo-500/20',
    amber: 'bg-amber-50 text-amber-600 shadow-amber-500/20',
    emerald: 'bg-emerald-50 text-emerald-600 shadow-emerald-500/20',
    rose: 'bg-rose-50 text-rose-600 shadow-rose-500/20'
  };
  return (
    <div className="card p-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white flex flex-col justify-between items-start hover:scale-105 transition-transform cursor-default">
      <div className={`p-3 rounded-2xl ${colorMap[color]} shadow-lg mb-4`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{title}</p>
      <p className="text-3xl font-black text-slate-800 mt-1">{value}</p>
    </div>
  );
}

interface AdminModalProps {
  mode: 'create' | 'edit' | 'delete';
  record: Attendance | null;
  onClose: () => void;
  onSave: (data: Partial<Attendance>) => void;
  onDelete: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  t: (key: string) => string;
  employeeOptions: { id: string; fullName: string; employeeCode: string }[];
}

function AdminModal({ mode, record, onClose, onSave, onDelete, isSaving, isDeleting, t, employeeOptions }: AdminModalProps) {
  const [formData, setFormData] = useState<Partial<Attendance>>(record || {
    employeeId: '',
    workDate: '',
    checkIn: '',
    checkOut: '',
    status: 'PRESENT',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (mode === 'delete') {
    return (
      <div className="modal-bg">
        <div className="modal bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl">
          <Trash2 size={40} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">{t('common.modal.delete')}</h2>
          <p className="text-slate-500 mb-6">{t('common.deleteConfirm')}</p>
          <div className="flex gap-4 justify-center">
            <button className="btn btn-secondary px-6 py-2" onClick={onClose}>{t('common.actions.cancel')}</button>
            <button className="btn btn-danger px-6 py-2" onClick={onDelete} disabled={isDeleting}>{t('common.actions.delete')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-bg">
      <div className="modal bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {t(`common.modal.${mode}`)}
          </h2>
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.employeeId')}</label>
            <select
              required
              className="input w-full"
              value={formData.employeeId}
              onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
            >
              <option value="">{t('common.select')}</option>
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.workDate')}</label>
            <input
              type="date"
              required
              className="input w-full"
              value={formData.workDate}
              onChange={e => setFormData({ ...formData, workDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.checkIn')}</label>
              <input
                type="datetime-local"
                className="input w-full"
                value={formData.checkIn ? formData.checkIn.substring(0, 16) : ''}
                onChange={e => setFormData({ ...formData, checkIn: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.checkOut')}</label>
              <input
                type="datetime-local"
                className="input w-full"
                value={formData.checkOut ? formData.checkOut.substring(0, 16) : ''}
                onChange={e => setFormData({ ...formData, checkOut: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.status')}</label>
            <select
              required
              className="input w-full"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            >
              {['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT', 'PAID_LEAVE', 'UNPAID_LEAVE'].map(s => (
                <option key={s} value={s}>{t(`statuses.${s}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.note')}</label>
            <input
              type="text"
              className="input w-full"
              value={formData.note || ''}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
            <button type="button" className="btn btn-secondary px-6" onClick={onClose}>{t('common.actions.cancel')}</button>
            <button type="submit" className="btn btn-primary px-6" disabled={isSaving}>{t('common.actions.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
