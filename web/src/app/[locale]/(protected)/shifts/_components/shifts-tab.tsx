'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useShifts, useSaveShift, useDeleteShift, Shift } from '@/features/shifts/api';
import { Portal } from '@/components/ui/portal';

export function ShiftsTab({ t }: { t: (key: string) => string }) {
  const { data: shiftsData, isLoading } = useShifts();
  const [mode, setMode] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const saveShift = useSaveShift();
  const deleteShift = useDeleteShift();

  const handleCreate = () => {
    setSelectedShift(null);
    setMode('create');
  };

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift);
    setMode('edit');
  };

  const handleDelete = (shift: Shift) => {
    setSelectedShift(shift);
    setMode('delete');
  };

  const isOvernight = (start: string, end: string) => {
    if (!start || !end) return false;
    return end <= start;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-slate-800">{t('shifts.tabs.shifts')}</h3>
        <button className="btn btn-primary px-5 py-2 rounded-xl shadow-lg shadow-indigo-500/20 text-sm" onClick={handleCreate}>
          <Plus size={16} /> {t('common.actions.create')}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/70">
              <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase tracking-wider">{t('fields.code')}</th>
              <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase tracking-wider">{t('fields.name')}</th>
              <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase tracking-wider">{t('fields.startAt')}</th>
              <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase tracking-wider">{t('fields.endAt')}</th>
              <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase tracking-wider">{t('fields.status')}</th>
              <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase tracking-wider text-right">{t('common.actions.title')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                  {t('common.loading')}
                </td>
              </tr>
            ) : shiftsData?.data.map((shift) => (
              <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-black text-slate-800">{shift.code}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-700">{shift.name}</div>
                  {isOvernight(shift.startTime, shift.endTime) && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full">
                      {t('shifts.overnight')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{shift.startTime}</td>
                <td className="px-6 py-4 font-bold text-slate-600">{shift.endTime}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${shift.isActive ? 'badge-active' : 'badge-inactive'}`}>
                    {t(`statuses.${shift.isActive ? 'ACTIVE' : 'INACTIVE'}`)}
                  </span>
                </td>
                <td className="px-6 py-4 flex justify-end gap-2">
                  <button className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl transition-all" onClick={() => handleEdit(shift)}>
                    <Pencil size={16} />
                  </button>
                  <button className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl transition-all" onClick={() => handleDelete(shift)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {(!shiftsData?.data || shiftsData.data.length === 0) && !isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                  {t('common.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {mode && (mode === 'create' || mode === 'edit') && (
        <ShiftModal
          mode={mode}
          shift={selectedShift}
          onClose={() => { setMode(null); setSelectedShift(null); }}
          onSave={(data) => { saveShift.mutate(data); setMode(null); }}
          isSaving={saveShift.isPending}
          t={t}
        />
      )}

      {mode === 'delete' && (
        <Portal>
          <div className="modal-bg">
            <div className="modal bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl">
              <Trash2 size={40} className="text-rose-500 mx-auto mb-4" />
              <h2 className="text-xl font-black text-slate-800 mb-2">{t('common.modal.delete')}</h2>
              <p className="text-slate-500 mb-6 text-sm">
                {t('common.deleteConfirm')}
                <br />
                <span className="text-rose-500 text-xs mt-2 block font-bold">
                  Note: If this shift has assignments, you cannot delete it. Consider setting it to Inactive instead.
                </span>
              </p>
              <div className="flex gap-3 justify-center">
                <button className="btn btn-secondary px-6 py-2" onClick={() => setMode(null)}>{t('common.actions.cancel')}</button>
                <button className="btn btn-danger px-6 py-2" onClick={() => { if(selectedShift) deleteShift.mutate(selectedShift.id); setMode(null); }} disabled={deleteShift.isPending}>{t('common.actions.delete')}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

interface ShiftModalProps {
  mode: 'create' | 'edit';
  shift: Shift | null;
  onClose: () => void;
  onSave: (data: Partial<Shift>) => void;
  isSaving: boolean;
  t: (key: string) => string;
}

function ShiftModal({ mode, shift, onClose, onSave, isSaving, t }: ShiftModalProps) {
  const [formData, setFormData] = useState<Partial<Shift>>(shift || {
    code: '',
    name: '',
    startTime: '08:00',
    endTime: '17:00',
    breakMinutes: 60,
    lateGraceMinutes: 5,
    earlyLeaveGraceMinutes: 5,
    overtimeAllowed: true,
    overtimeThresholdMinutes: 30,
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isOvernight = formData.startTime && formData.endTime && formData.endTime <= formData.startTime;

  return (
    <Portal>
      <div className="modal-bg p-4 overflow-y-auto">
        <div className="modal bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl relative my-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800">
              {t(`common.modal.${mode}`)}
            </h2>
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors" onClick={onClose}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.code')}</label>
                <input required type="text" className="input w-full" value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.name')}</label>
                <input required type="text" className="input w-full" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.startTime')}</label>
                <input required type="time" className="input w-full" value={formData.startTime || ''} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  {t('fields.endTime')}
                  {isOvernight && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{t('shifts.overnight')}</span>}
                </label>
                <input required type="time" className="input w-full" value={formData.endTime || ''} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.breakMinutes')}</label>
                <input required type="number" min="0" max="720" className="input w-full" value={formData.breakMinutes ?? ''} onChange={e => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.isActive')}</label>
                <select className="input w-full" value={formData.isActive ? 'true' : 'false'} onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}>
                  <option value="true">{t('statuses.ACTIVE')}</option>
                  <option value="false">{t('statuses.INACTIVE')}</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.lateGraceMinutes')}</label>
                  <input required type="number" min="0" max="180" className="input w-full bg-white" value={formData.lateGraceMinutes ?? ''} onChange={e => setFormData({ ...formData, lateGraceMinutes: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.earlyLeaveGraceMinutes')}</label>
                  <input required type="number" min="0" max="180" className="input w-full bg-white" value={formData.earlyLeaveGraceMinutes ?? ''} onChange={e => setFormData({ ...formData, earlyLeaveGraceMinutes: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.overtimeAllowed')}</label>
                  <select className="input w-full bg-white" value={formData.overtimeAllowed ? 'true' : 'false'} onChange={e => setFormData({ ...formData, overtimeAllowed: e.target.value === 'true' })}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                {formData.overtimeAllowed && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t('fields.overtimeThresholdMinutes')}</label>
                    <input required type="number" min="0" max="240" className="input w-full bg-white" value={formData.overtimeThresholdMinutes ?? ''} onChange={e => setFormData({ ...formData, overtimeThresholdMinutes: parseInt(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button type="button" className="btn btn-secondary px-6" onClick={onClose}>{t('common.actions.cancel')}</button>
              <button type="submit" className="btn btn-primary px-8" disabled={isSaving}>{t('common.actions.save')}</button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
