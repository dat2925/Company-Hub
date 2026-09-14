'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, X, Calendar, UserRound, Clock } from 'lucide-react';
import { useShiftAssignments, useSaveAssignment, useBulkSaveAssignments, useDeleteAssignment, ShiftAssignment } from '@/features/shift-assignments/api';
import { useShiftOptions } from '@/features/shifts/api';
import { Portal } from '@/components/ui/portal';
import { api } from '@/lib/api/client';
import { useAuth } from '@/features/auth/auth-context';

export function AssignmentsTab({ t, isAdmin }: { t: (key: string) => string; isAdmin: boolean }) {
  const { user } = useAuth();
  
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0]
    };
  });
  
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
  
  const currentEmployeeId = isAdmin && filterEmployeeId ? filterEmployeeId : !isAdmin ? (user?.employee as any)?.id : undefined;

  const { data: assignmentsData, isLoading } = useShiftAssignments({
    from: dateRange.from,
    to: dateRange.to,
    employeeId: currentEmployeeId,
    pageSize: 100 // simplified for now
  });

  const { data: shiftOptions } = useShiftOptions();
  
  const { data: employeeOptions } = useQuery({
    queryKey: ['employees', 'options'],
    queryFn: () => api.get<{ id: string; fullName: string; employeeCode: string }[]>('/employees/options/list'),
    enabled: isAdmin
  });

  const [mode, setMode] = useState<'create' | 'bulk' | 'delete' | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<ShiftAssignment | null>(null);

  const saveAssignment = useSaveAssignment();
  const bulkSaveAssignments = useBulkSaveAssignments();
  const deleteAssignment = useDeleteAssignment();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input py-2 text-sm font-semibold rounded-xl w-36"
              value={dateRange.from}
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
            />
            <span className="text-slate-400 font-bold">-</span>
            <input
              type="date"
              className="input py-2 text-sm font-semibold rounded-xl w-36"
              value={dateRange.to}
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
            />
          </div>
          {isAdmin && (
            <select
              className="input py-2 text-sm font-semibold rounded-xl min-w-[200px]"
              value={filterEmployeeId}
              onChange={e => setFilterEmployeeId(e.target.value)}
            >
              <option value="">-- {t('common.select')} Employee --</option>
              {employeeOptions?.data?.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.fullName}</option>
              ))}
            </select>
          )}
        </div>
        
        {isAdmin && (
          <div className="flex gap-3">
            <button className="btn bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl shadow-sm text-sm" onClick={() => setMode('create')}>
              {t('shifts.assignSingle')}
            </button>
            <button className="btn btn-primary px-5 py-2 rounded-xl shadow-lg shadow-indigo-500/20 text-sm" onClick={() => setMode('bulk')}>
              <Plus size={16} /> {t('shifts.assignBulk')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold">
            {t('common.loading')}
          </div>
        ) : assignmentsData?.data.map((assignment) => (
          <div key={assignment.id} className="card p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
            {isAdmin && (
              <button 
                className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                onClick={() => { setSelectedAssignment(assignment); setMode('delete'); }}
              >
                <Trash2 size={16} />
              </button>
            )}
            
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                {new Date(assignment.workDate).getDate()}
              </div>
              <div>
                <p className="font-bold text-slate-800 leading-tight">{assignment.workDate}</p>
                <p className="text-xs text-slate-500 font-medium">{new Date(assignment.workDate).toLocaleDateString(undefined, { weekday: 'long' })}</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {isAdmin && (
                <div className="flex items-center gap-2 text-sm">
                  <UserRound size={14} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{assignment.employee?.fullName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-indigo-400" />
                <span className="font-bold text-indigo-700">{assignment.shift?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-slate-400" />
                <span className="text-slate-600 font-medium">
                  {assignment.scheduledStartAt} - {assignment.scheduledEndAt}
                </span>
                {assignment.scheduledEndAt <= assignment.scheduledStartAt && (
                   <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-1">Night</span>
                )}
              </div>
              {assignment.note && (
                <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                  {assignment.note}
                </div>
              )}
            </div>
          </div>
        ))}
        {(!assignmentsData?.data || assignmentsData.data.length === 0) && !isLoading && (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-white/50 rounded-2xl border border-dashed border-slate-300">
            {t('common.empty')}
          </div>
        )}
      </div>

      {mode === 'create' && isAdmin && (
        <SingleAssignmentModal
          onClose={() => setMode(null)}
          onSave={(data) => { saveAssignment.mutate(data); setMode(null); }}
          isSaving={saveAssignment.isPending}
          t={t}
          employeeOptions={employeeOptions?.data || []}
          shiftOptions={shiftOptions?.data || []}
        />
      )}

      {mode === 'bulk' && isAdmin && (
        <BulkAssignmentModal
          onClose={() => setMode(null)}
          onSave={(data) => { bulkSaveAssignments.mutate(data); setMode(null); }}
          isSaving={bulkSaveAssignments.isPending}
          t={t}
          employeeOptions={employeeOptions?.data || []}
          shiftOptions={shiftOptions?.data || []}
        />
      )}

      {mode === 'delete' && isAdmin && (
        <Portal>
          <div className="modal-bg">
            <div className="modal bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl">
              <Trash2 size={40} className="text-rose-500 mx-auto mb-4" />
              <h2 className="text-xl font-black text-slate-800 mb-2">{t('common.modal.delete')}</h2>
              <p className="text-slate-500 mb-6 text-sm">{t('common.deleteConfirm')}</p>
              <div className="flex gap-3 justify-center">
                <button className="btn btn-secondary px-6 py-2" onClick={() => setMode(null)}>{t('common.actions.cancel')}</button>
                <button className="btn btn-danger px-6 py-2" onClick={() => { if(selectedAssignment) deleteAssignment.mutate(selectedAssignment.id); setMode(null); }} disabled={deleteAssignment.isPending}>{t('common.actions.delete')}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

interface EmployeeOption { id: string; fullName: string; employeeCode: string; }
interface ShiftOption { id: string; name: string; startTime: string; endTime: string; }

interface SingleAssignmentModalProps {
  onClose: () => void;
  onSave: (data: Partial<ShiftAssignment>) => void;
  isSaving: boolean;
  t: (key: string) => string;
  employeeOptions: EmployeeOption[];
  shiftOptions: ShiftOption[];
}

function SingleAssignmentModal({ onClose, onSave, isSaving, t, employeeOptions, shiftOptions }: SingleAssignmentModalProps) {
  const [formData, setFormData] = useState<Partial<ShiftAssignment>>({
    employeeId: '',
    shiftId: '',
    workDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Portal>
      <div className="modal-bg p-4 overflow-y-auto">
        <div className="modal bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl my-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">
              {t('shifts.assignSingle')}
            </h2>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400" onClick={onClose}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase">{t('fields.employeeId')}</label>
              <select required className="input w-full" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })}>
                <option value="">{t('common.select')}</option>
                {employeeOptions.map((emp) => <option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.fullName}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase">{t('fields.shiftId')}</label>
              <select required className="input w-full" value={formData.shiftId} onChange={e => setFormData({ ...formData, shiftId: e.target.value })}>
                <option value="">{t('common.select')}</option>
                {shiftOptions.map((shift) => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime}-{shift.endTime})</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase">{t('fields.workDate')}</label>
              <input required type="date" className="input w-full" value={formData.workDate} onChange={e => setFormData({ ...formData, workDate: e.target.value })} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase">{t('fields.note')}</label>
              <input type="text" className="input w-full" value={formData.note || ''} onChange={e => setFormData({ ...formData, note: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" className="btn btn-secondary px-6" onClick={onClose}>{t('common.actions.cancel')}</button>
              <button type="submit" className="btn btn-primary px-8" disabled={isSaving}>{t('common.actions.save')}</button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

interface BulkAssignmentModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
  isSaving: boolean;
  t: (key: string) => string;
  employeeOptions: EmployeeOption[];
  shiftOptions: ShiftOption[];
}

function BulkAssignmentModal({ onClose, onSave, isSaving, t, employeeOptions, shiftOptions }: BulkAssignmentModalProps) {
  const [formData, setFormData] = useState<{ employeeIds: string[], shiftId: string, startDate: string, endDate: string, daysOfWeek: number[], note: string }>({
    employeeIds: [],
    shiftId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    daysOfWeek: [1,2,3,4,5],
    note: ''
  });

  const days = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleDay = (val: number) => {
    if (formData.daysOfWeek.includes(val)) {
      setFormData({ ...formData, daysOfWeek: formData.daysOfWeek.filter((d) => d !== val) });
    } else {
      setFormData({ ...formData, daysOfWeek: [...formData.daysOfWeek, val] });
    }
  };

  const toggleEmployee = (val: string) => {
    if (formData.employeeIds.includes(val)) {
      setFormData({ ...formData, employeeIds: formData.employeeIds.filter((id) => id !== val) });
    } else {
      setFormData({ ...formData, employeeIds: [...formData.employeeIds, val] });
    }
  };
  
  const selectAllEmployees = () => {
    setFormData({ ...formData, employeeIds: employeeOptions.map((e) => e.id) });
  };
  
  const clearAllEmployees = () => {
    setFormData({ ...formData, employeeIds: [] });
  };

  return (
    <Portal>
      <div className="modal-bg p-4 overflow-y-auto">
        <div className="modal bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl my-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">
              {t('shifts.assignBulk')}
            </h2>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400" onClick={onClose}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-black text-slate-500 uppercase">{t('fields.employeeId')} ({formData.employeeIds.length})</label>
                  <div className="flex gap-2">
                    <button type="button" className="text-[10px] font-bold text-indigo-600 hover:underline" onClick={selectAllEmployees}>Select All</button>
                    <button type="button" className="text-[10px] font-bold text-slate-400 hover:underline" onClick={clearAllEmployees}>Clear</button>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl max-h-40 overflow-y-auto p-2 bg-slate-50">
                  {employeeOptions.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                        checked={formData.employeeIds.includes(emp.id)} 
                        onChange={() => toggleEmployee(emp.id)} 
                      />
                      <span className="text-sm font-medium text-slate-700">{emp.employeeCode} - {emp.fullName}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase">{t('fields.shiftId')}</label>
                <select required className="input w-full" value={formData.shiftId} onChange={e => setFormData({ ...formData, shiftId: e.target.value })}>
                  <option value="">{t('common.select')}</option>
                  {shiftOptions.map((shift) => <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime}-{shift.endTime})</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase">{t('fields.startDate')}</label>
                <input required type="date" className="input w-full" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase">{t('fields.endDate')}</label>
                <input required type="date" className="input w-full" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase">{t('shifts.bulk.daysOfWeek')}</label>
                <div className="flex flex-wrap gap-2">
                  {days.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        formData.daysOfWeek.includes(d.value) 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase">{t('fields.note')}</label>
                <input type="text" className="input w-full" value={formData.note || ''} onChange={e => setFormData({ ...formData, note: e.target.value })} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button type="button" className="btn btn-secondary px-6" onClick={onClose}>{t('common.actions.cancel')}</button>
              <button type="submit" className="btn btn-primary px-8" disabled={isSaving || formData.employeeIds.length === 0}>{t('common.actions.save')}</button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
