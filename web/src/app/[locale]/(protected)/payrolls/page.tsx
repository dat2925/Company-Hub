'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Banknote,
  Calculator,
  CheckCircle2,
  Lock,
  Pencil,
  Search,
  Wallet,
  X
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/auth-context';
import {
  useCalculatePayroll,
  useFinalizePayroll,
  useMySalaryProfile,
  usePayrolls,
  useSalaryProfiles,
  useUpdateSalaryProfile,
  SalaryProfile,
  Payroll
} from '@/features/payrolls/api';
import { api } from '@/lib/api/client';

type Tab = 'payrolls' | 'config';

export default function PayrollsPage() {
  const t = useTranslations();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<Tab>('payrolls');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [search, setSearch] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  
  const isAdmin = user?.role === 'ADMIN';
  const { data: employeeOptions } = useQuery({
    queryKey: ['employees', 'options'],
    queryFn: () => api.get<{ id: string; fullName: string; employeeCode: string }[]>('/employees/options/list'),
    enabled: isAdmin
  });

  return (
    <section className="space-y-8 py-4 perspective-2000 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 stagger-item delay-100">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight title-gradient flex items-center gap-4">
            <Banknote size={40} className="text-indigo-600" />
            {t('payrolls.title')}
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl text-sm sm:text-base">
            {t('payrolls.description')}
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 shadow-inner">
            <button
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'payrolls' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('payrolls')}
            >
              {t('payrolls.tabs.payrolls')}
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'config' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('config')}
            >
              {t('payrolls.tabs.config')}
            </button>
          </div>
        )}
      </div>

      {activeTab === 'payrolls' && (
        <PayrollsTab 
          month={month} 
          setMonth={setMonth} 
          employeeId={employeeId} 
          setEmployeeId={setEmployeeId} 
          search={search} 
          setSearch={setSearch} 
          isAdmin={isAdmin}
          employeeOptions={employeeOptions?.data || []}
          t={t}
        />
      )}

      {activeTab === 'config' && isAdmin && (
        <SalaryConfigTab search={search} setSearch={setSearch} t={t} employeeOptions={employeeOptions?.data || []} />
      )}
    </section>
  );
}

interface PayrollsTabProps {
  month: string;
  setMonth: (v: string) => void;
  employeeId: string;
  setEmployeeId: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  isAdmin: boolean;
  employeeOptions: { id: string; fullName: string; employeeCode: string }[];
  t: (key: string) => string;
}

function PayrollsTab({ month, setMonth, employeeId, setEmployeeId, search, setSearch, isAdmin, employeeOptions, t }: PayrollsTabProps) {
  const currentEmployeeId = isAdmin && employeeId ? employeeId : undefined;
  
  const { data: payrolls, isLoading } = usePayrolls({ page: 1, pageSize: 100, month, employeeId: currentEmployeeId, search });
  const calculate = useCalculatePayroll();
  const finalize = useFinalizePayroll();

  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

  const handleCalculateAll = () => {
    if (confirm(t('payrolls.calculateConfirm'))) {
      calculate.mutate({ month });
    }
  };

  const handleRecalculate = (payroll: Payroll) => {
    calculate.mutate({ month: `${payroll.year}-${String(payroll.month).padStart(2, '0')}`, employeeId: payroll.employeeId });
  };

  const handleFinalize = (payroll: Payroll) => {
    if (confirm(t('payrolls.finalizeConfirm'))) {
      finalize.mutate(payroll.id);
    }
  };

  const formatCurrency = (amount: string | number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(Number(amount));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 stagger-item delay-200">
        {isAdmin && (
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <select
              className="input pl-9 pr-10 py-2 text-sm font-semibold rounded-xl"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
            >
              <option value="">-- {t('common.select')} Employee --</option>
              {employeeOptions.map((emp) => (
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
          <button 
            className="btn btn-primary rounded-xl px-5 py-2 shadow-lg ml-auto" 
            onClick={handleCalculateAll}
            disabled={calculate.isPending}
          >
            <Calculator size={18} /> {t('payrolls.calculateAll')}
          </button>
        )}
      </div>

      <div className="stagger-item delay-300 card bg-white/80 backdrop-blur-2xl shadow-xl border border-white/90 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70">
                {isAdmin && <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.fullName')}</th>}
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.baseSalary')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.attendancePay')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.overtimePay')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.allowance')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.netSalary')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.status')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase text-right">{t('common.actions.title')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrolls?.data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  {isAdmin && <td className="px-6 py-4 font-bold text-slate-800">{row.employee?.fullName}</td>}
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.baseSalary, row.currency)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.attendancePay, row.currency)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.overtimePay, row.currency)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.allowance, row.currency)}</td>
                  <td className="px-6 py-4 text-emerald-600 font-black">{formatCurrency(row.netSalary, row.currency)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${row.status === 'FINALIZED' ? 'badge-completed' : 'badge-draft'}`}>
                      {t(`statuses.${row.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      className="p-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-500 hover:text-white rounded-xl transition-all"
                      title={t('common.actions.view')}
                      onClick={() => setSelectedPayroll(row)}
                    >
                      <Wallet size={16} />
                    </button>
                    {isAdmin && row.status === 'DRAFT' && (
                      <>
                        <button 
                          className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                          title={t('payrolls.recalculate')}
                          onClick={() => handleRecalculate(row)}
                        >
                          <Calculator size={16} />
                        </button>
                        <button 
                          className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                          title={t('payrolls.finalize')}
                          onClick={() => handleFinalize(row)}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {(!payrolls?.data || payrolls.data.length === 0) && !isLoading && (
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

      {selectedPayroll && (
        <PayrollDetailModal 
          payroll={selectedPayroll} 
          onClose={() => setSelectedPayroll(null)} 
          t={t}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

interface PayrollDetailModalProps {
  payroll: Payroll;
  onClose: () => void;
  t: (key: string) => string;
  formatCurrency: (amount: string | number, currency: string) => string;
}

function PayrollDetailModal({ payroll, onClose, t, formatCurrency }: PayrollDetailModalProps) {
  return (
    <div className="modal-bg">
      <div className="modal bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"></div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {t('payrolls.breakdown')}
          </h2>
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.employeeCode')}</p>
              <p className="font-bold text-slate-800">{payroll.employee?.fullName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fields.status')}</p>
              <span className={`badge ${payroll.status === 'FINALIZED' ? 'badge-completed' : 'badge-draft'}`}>
                {t(`statuses.${payroll.status}`)}
              </span>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <dt className="text-slate-500 font-medium">{t('fields.baseSalary')}</dt>
              <dd className="font-bold text-slate-800">{formatCurrency(payroll.baseSalary, payroll.currency)}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500 font-medium">{t('fields.attendancePay')} ({payroll.regularMinutes + payroll.paidLeaveMinutes}m)</dt>
              <dd className="font-bold text-emerald-600">+{formatCurrency(payroll.attendancePay, payroll.currency)}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500 font-medium">{t('fields.overtimePay')} ({payroll.overtimeMinutes}m)</dt>
              <dd className="font-bold text-emerald-600">+{formatCurrency(payroll.overtimePay, payroll.currency)}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500 font-medium">{t('fields.allowance')}</dt>
              <dd className="font-bold text-emerald-600">+{formatCurrency(payroll.allowance, payroll.currency)}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500 font-medium">{t('fields.deductions')}</dt>
              <dd className="font-bold text-rose-600">-{formatCurrency(payroll.deductions, payroll.currency)}</dd>
            </div>
          </dl>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <dt className="text-lg font-black text-slate-800 uppercase">{t('fields.netSalary')}</dt>
              <dd className="text-2xl font-black text-indigo-600">{formatCurrency(payroll.netSalary, payroll.currency)}</dd>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button className="btn btn-secondary w-full py-3 rounded-xl" onClick={onClose}>{t('common.actions.cancel')}</button>
        </div>
      </div>
    </div>
  );
}

interface SalaryConfigTabProps {
  search: string;
  setSearch: (v: string) => void;
  t: (key: string) => string;
  employeeOptions: { id: string; fullName: string; employeeCode: string }[];
}

function SalaryConfigTab({ search, setSearch, t, employeeOptions }: SalaryConfigTabProps) {
  const { data: profiles, isLoading } = useSalaryProfiles({ page: 1, pageSize: 100, search });
  const [selectedProfile, setSelectedProfile] = useState<SalaryProfile | { employeeId: string } | null>(null);

  const formatCurrency = (amount: string | number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(Number(amount || 0));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 stagger-item delay-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            className="input pl-9 pr-4 py-2 text-sm font-semibold rounded-xl w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('common.search')}
          />
        </div>
        <button 
          className="btn btn-primary rounded-xl px-5 py-2 shadow-lg ml-auto" 
          onClick={() => setSelectedProfile({ employeeId: '' })}
        >
          <Pencil size={18} /> {t('common.actions.create')} / {t('common.actions.edit')}
        </button>
      </div>

      <div className="stagger-item delay-300 card bg-white/80 backdrop-blur-2xl shadow-xl border border-white/90 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/70">
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.fullName')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.baseSalary')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.allowance')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase">{t('fields.overtimeHourlyRate')}</th>
                <th className="px-6 py-4 text-xs font-black text-indigo-500 uppercase text-right">{t('common.actions.title')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles?.data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{row.employee?.fullName}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.baseSalary, row.currency)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.allowance, row.currency)}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{formatCurrency(row.overtimeHourlyRate, row.currency)}</td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button 
                      className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white rounded-xl transition-all"
                      title={t('common.actions.edit')}
                      onClick={() => setSelectedProfile(row)}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!profiles?.data || profiles.data.length === 0) && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                    {t('common.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProfile && (
        <SalaryProfileModal 
          profile={selectedProfile} 
          onClose={() => setSelectedProfile(null)} 
          t={t}
          employeeOptions={employeeOptions}
        />
      )}
    </div>
  );
}

interface SalaryProfileModalProps {
  profile: SalaryProfile | { employeeId: string; id?: string; baseSalary?: number; allowance?: number; overtimeHourlyRate?: number; standardWorkingDays?: number; standardMinutesPerDay?: number; currency?: string };
  onClose: () => void;
  t: (key: string) => string;
  employeeOptions: { id: string; fullName: string; employeeCode: string }[];
}

function SalaryProfileModal({ profile, onClose, t, employeeOptions }: SalaryProfileModalProps) {
  const updateProfile = useUpdateSalaryProfile();
  
  const [formData, setFormData] = useState({
    employeeId: profile.employeeId || '',
    baseSalary: profile.baseSalary?.toString() || '0',
    allowance: profile.allowance?.toString() || '0',
    overtimeHourlyRate: profile.overtimeHourlyRate?.toString() || '0',
    standardWorkingDays: profile.standardWorkingDays?.toString() || '26',
    standardMinutesPerDay: profile.standardMinutesPerDay?.toString() || '480',
    currency: profile.currency || 'VND'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        employeeId: formData.employeeId,
        baseSalary: Number(formData.baseSalary),
        allowance: Number(formData.allowance),
        overtimeHourlyRate: Number(formData.overtimeHourlyRate),
        standardWorkingDays: Number(formData.standardWorkingDays),
        standardMinutesPerDay: Number(formData.standardMinutesPerDay),
        currency: formData.currency
      },
      {
        onSuccess: () => onClose()
      }
    );
  };

  return (
    <div className="modal-bg">
      <div className="modal bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-800">
            {t('salaryProfile.title')}
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
              disabled={!!profile.id}
            >
              <option value="">{t('common.select')}</option>
              {employeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.baseSalary')}</label>
            <input
              type="number"
              required
              className="input w-full"
              value={formData.baseSalary}
              onChange={e => setFormData({ ...formData, baseSalary: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.allowance')}</label>
            <input
              type="number"
              className="input w-full"
              value={formData.allowance}
              onChange={e => setFormData({ ...formData, allowance: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.overtimeHourlyRate')}</label>
            <input
              type="number"
              className="input w-full"
              value={formData.overtimeHourlyRate}
              onChange={e => setFormData({ ...formData, overtimeHourlyRate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.standardWorkingDays')}</label>
              <input
                type="number"
                required
                className="input w-full"
                value={formData.standardWorkingDays}
                onChange={e => setFormData({ ...formData, standardWorkingDays: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.standardMinutesPerDay')}</label>
              <input
                type="number"
                required
                className="input w-full"
                value={formData.standardMinutesPerDay}
                onChange={e => setFormData({ ...formData, standardMinutesPerDay: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">{t('fields.currency')}</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
            <button type="button" className="btn btn-secondary px-6" onClick={onClose}>{t('common.actions.cancel')}</button>
            <button type="submit" className="btn btn-primary px-6" disabled={updateProfile.isPending}>{t('common.actions.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
