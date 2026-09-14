'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck,
  Clock,
  Clock4,
  Frown,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  ChevronRight,
  Info,
  CalendarDays
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Portal } from '@/components/ui/portal';
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
import { useShiftAssignments } from '@/features/shift-assignments/api';
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

  const { data: summaryData } = useAttendanceSummary({ month, employeeId: currentEmployeeId });
  const { data: listData, isLoading: loadingList } = useAttendanceList({ page: 1, pageSize: 100, month, employeeId: currentEmployeeId });
  
  const { mutate: checkIn, isPending: checkingIn } = useCheckIn();
  const { mutate: checkOut, isPending: checkingOut } = useCheckOut();
  
  const { data: employeeOptions } = useQuery({
    queryKey: ['employees', 'options'],
    queryFn: () => api.get<{ id: string; fullName: string; employeeCode: string }[]>('/employees/options/list'),
    enabled: isAdmin
  });

  const localDate = new Date();
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  const today = localDate.toISOString().split('T')[0];
  const todayRecord = listData?.data.find(r => String(r.workDate).split('T')[0] === today);
  
  const [mode, setMode] = useState<'create' | 'edit' | 'delete' | 'detail' | null>(null);
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
    <section className="space-y-8 py-4 perspective-2000 relative z-10 animate-in fade-in duration-500">
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
          <StatCard title={t('attendance.overtime')} value={summary.overtimeRecords} icon={Clock4} color="amber" subtitle={`${formatMinutes(summary.overtimeMinutes)} total`} />
          <StatCard title={t('attendance.presentDays')} value={summary.byStatus['PRESENT'] || 0} icon={CheckCircle2} color="emerald" />
          <StatCard title={t('attendance.lateDays')} value={summary.byStatus['LATE'] || 0} icon={Frown} color="rose" subtitle={`${formatMinutes(summary.lateArrivalMinutes)} total late`} />
        </div>
      )}

      <div className="stagger-item delay-400 card bg-white/80 backdrop-blur-2xl shadow-xl border border-white/90 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70">
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.workDate')}</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.employeeCode')}</th>}
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.shift')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.checkIn')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.checkOut')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.status')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.workedMinutes')}</th>
                {isAdmin && <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase text-right">{t('common.actions.title')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingList ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center text-slate-400 font-bold">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : listData?.data.map((row) => (
                <tr key={row.id} className="hover:bg-indigo-50/50 transition-colors cursor-pointer group" onClick={() => { setSelectedRecord(row); setMode('detail'); }}>
                  <td className="px-6 py-4 font-bold text-slate-800">{row.workDate}</td>
                  {isAdmin && <td className="px-6 py-4 font-bold text-slate-600">{row.employee?.fullName}</td>}
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {row.shiftAssignment ? (
                      <div>
                        <span className="font-bold">{row.shiftAssignment.shift.code}</span>
                        <div className="text-xs text-slate-400">
                          {row.shiftAssignment.shift.startTime} - {row.shiftAssignment.shift.endTime}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">{t('attendance.noShift')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {row.checkIn ? new Date(row.checkIn).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {row.checkOut ? new Date(row.checkOut).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      {renderStatus(row.status)}
                      {row.hasOvertime && (
                        <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-sm">OT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600 flex items-center justify-between">
                    <span>{formatMinutes(row.workedMinutes)}</span>
                    <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl transition-all" onClick={() => { setSelectedRecord(row); setMode('edit'); }}>
                          <Pencil size={16} />
                        </button>
                        <button className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition-all" onClick={() => { setSelectedRecord(row); setMode('delete'); }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {(!listData?.data || listData.data.length === 0) && !loadingList && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center text-slate-400 font-bold">
                    {t('common.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mode === 'detail' && selectedRecord && (
        <DetailDrawer
          record={selectedRecord}
          onClose={() => { setMode(null); setSelectedRecord(null); }}
          t={t}
          formatMinutes={formatMinutes}
          renderStatus={renderStatus}
        />
      )}

      {(mode === 'create' || mode === 'edit') && isAdmin && (
        <AdminModal 
          mode={mode} 
          record={selectedRecord}
          onClose={() => { setMode(null); setSelectedRecord(null); }}
          onSave={(data) => { saveRecord.mutate(data); setMode(null); }}
          isSaving={saveRecord.isPending}
          t={t}
          employeeOptions={employeeOptions?.data || []}
        />
      )}

      {mode === 'delete' && isAdmin && (
        <Portal>
          <div className="modal-bg">
            <div className="modal bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl">
              <Trash2 size={40} className="text-rose-500 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-slate-800 mb-2">{t('common.modal.delete')}</h2>
              <p className="text-slate-500 mb-6">{t('common.deleteConfirm')}</p>
              <div className="flex gap-4 justify-center">
                <button className="btn btn-secondary px-6 py-2" onClick={() => { setMode(null); setSelectedRecord(null); }}>{t('common.actions.cancel')}</button>
                <button className="btn btn-danger px-6 py-2" onClick={() => { if(selectedRecord) deleteRecord.mutate(selectedRecord.id); setMode(null); }} disabled={deleteRecord.isPending}>{t('common.actions.delete')}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </section>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string, value: string | number, icon: React.ElementType, color: string, subtitle?: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 shadow-indigo-500/20',
    amber: 'bg-amber-50 text-amber-600 shadow-amber-500/20',
    emerald: 'bg-emerald-50 text-emerald-600 shadow-emerald-500/20',
    rose: 'bg-rose-50 text-rose-600 shadow-rose-500/20'
  };
  return (
    <div className="card p-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white flex flex-col justify-between items-start hover:scale-105 transition-transform cursor-default relative overflow-hidden">
      <div className={`p-3 rounded-2xl ${colorMap[color]} shadow-lg mb-4`}>
        <Icon size={24} />
      </div>
      <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{title}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-3xl font-black text-slate-800 leading-none">{value}</p>
        {subtitle && <p className="text-xs font-bold text-slate-400 mb-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

interface DetailDrawerProps {
  record: Attendance;
  onClose: () => void;
  t: (key: string) => string;
  formatMinutes: (mins: number) => string;
  renderStatus: (status: string) => React.ReactNode;
}

function DetailDrawer({ record, onClose, t, formatMinutes, renderStatus }: DetailDrawerProps) {
  const diffBlock = (label: string, value: number, isGood: boolean) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      {value > 0 ? (
        <span className={`text-sm font-bold ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>{formatMinutes(value)}</span>
      ) : (
        <span className="text-sm font-bold text-slate-300">{t('attendance.onTime')}</span>
      )}
    </div>
  );

  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300" onClick={onClose}>
        <div className="w-full max-w-md h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-xl font-black text-slate-800">{record.employee?.fullName || t('fields.employeeId')}</h2>
              <p className="text-sm font-bold text-slate-500 mt-0.5">{record.workDate}</p>
            </div>
            <button className="p-2 rounded-full hover:bg-slate-200 text-slate-400 transition-colors" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('fields.status')}</p>
                {renderStatus(record.status)}
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('fields.shift')}</p>
                {record.shiftAssignment ? (
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">{record.shiftAssignment.shift.name}</span>
                ) : (
                  <span className="text-slate-400 italic font-bold">{t('attendance.noShift')}</span>
                )}
              </div>
            </div>

            <div className="card p-5 bg-slate-50 border border-slate-200/60 rounded-2xl">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CalendarDays size={16} className="text-indigo-500" /> {t('attendance.scheduled')}
              </h3>
              {record.shiftAssignment ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500">Time</span>
                    <span className="font-bold text-slate-800">{record.shiftAssignment.shift.startTime} - {record.shiftAssignment.shift.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500">{t('fields.scheduledMinutes')}</span>
                    <span className="font-bold text-slate-800">{formatMinutes(record.scheduledMinutes)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500">{t('fields.breakMinutes')}</span>
                    <span className="font-bold text-slate-800">{record.shiftAssignment.shift.breakMinutes}m</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500">{t('fields.lateGraceMinutes')}</span>
                    <span className="font-bold text-slate-800">{record.shiftAssignment.shift.lateGraceMinutes}m</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500">{t('fields.overtimeAllowed')}</span>
                    <span className="font-bold text-slate-800">{record.shiftAssignment.shift.overtimeAllowed ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">{t('attendance.noShift')}</p>
              )}
            </div>

            <div className="card p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
              <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" /> {t('attendance.actual')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">{t('fields.checkIn')}</span>
                  <span className="font-bold text-slate-800">{record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '—'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">{t('fields.checkOut')}</span>
                  <span className="font-bold text-slate-800">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '—'}</span>
                </div>
                <div className="pt-3 border-t border-indigo-100/80 flex justify-between items-center text-sm">
                  <span className="font-black text-indigo-900">{t('fields.workedMinutes')}</span>
                  <span className="font-black text-indigo-700 text-lg">{formatMinutes(record.workedMinutes)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">{t('fields.regularMinutes')}</span>
                  <span className="font-bold text-slate-800">{formatMinutes(record.regularMinutes)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">{t('fields.overtimeMinutes')}</span>
                  <span className={`font-bold ${record.overtimeMinutes > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{formatMinutes(record.overtimeMinutes)}</span>
                </div>
              </div>
            </div>

            <div className="card p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock4 size={16} className="text-rose-400" /> {t('attendance.difference')}
              </h3>
              
              {record.shiftAssignment ? (
                <>
                  <div className="flex items-start gap-2 mb-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500">
                    <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p>{t('attendance.graceNote')}</p>
                  </div>
                  <div className="space-y-1">
                    {diffBlock(t('fields.lateArrivalMinutes'), record.lateArrivalMinutes, false)}
                    {diffBlock(t('fields.earlyLeaveMinutes'), record.earlyLeaveMinutes, false)}
                    {diffBlock(t('fields.earlyArrivalMinutes'), record.earlyArrivalMinutes, true)}
                    {diffBlock(t('fields.lateLeaveMinutes'), record.lateLeaveMinutes, true)}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">{t('attendance.noShift')}</p>
              )}
            </div>
            
            {record.note && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 italic">
                &quot;{record.note}&quot;
              </div>
            )}

          </div>
        </div>
      </div>
    </Portal>
  );
}

interface AdminModalProps {
  mode: 'create' | 'edit';
  record: Attendance | null;
  onClose: () => void;
  onSave: (data: Partial<Attendance>) => void;
  isSaving: boolean;
  t: (key: string) => string;
  employeeOptions: { id: string; fullName: string; employeeCode: string }[];
}

function AdminModal({ mode, record, onClose, onSave, isSaving, t, employeeOptions }: AdminModalProps) {
  const [formData, setFormData] = useState<Partial<Attendance>>(record || {
    employeeId: '',
    shiftAssignmentId: '',
    workDate: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'PRESENT',
    note: ''
  });

  const { data: assignmentsData } = useShiftAssignments({
    employeeId: formData.employeeId || undefined,
    from: formData.workDate || undefined,
    to: formData.workDate || undefined,
    pageSize: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      shiftAssignmentId: formData.shiftAssignmentId || null
    });
  };

  return (
    <Portal>
      <div className="modal-bg p-4 overflow-y-auto">
        <div className="modal bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl my-auto">
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
                onChange={e => setFormData({ ...formData, employeeId: e.target.value, shiftAssignmentId: '' })}
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
                onChange={e => setFormData({ ...formData, workDate: e.target.value, shiftAssignmentId: '' })}
              />
            </div>
            
            {formData.employeeId && formData.workDate && (
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.shiftId')} (Optional)</label>
                <select
                  className="input w-full"
                  value={formData.shiftAssignmentId || ''}
                  onChange={e => setFormData({ ...formData, shiftAssignmentId: e.target.value })}
                >
                  <option value="">Auto-assign / No Shift</option>
                  {assignmentsData?.data?.map(sa => (
                    <option key={sa.id} value={sa.id}>{sa.shift?.name} ({sa.scheduledStartAt}-{sa.scheduledEndAt})</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1 pl-1">Leave blank to let system auto-assign based on date.</p>
              </div>
            )}

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
    </Portal>
  );
}
