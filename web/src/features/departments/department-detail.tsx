'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BriefcaseBusiness, Network, Save, ShieldCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { configs } from '@/features/crud/config';
import { CrudPage } from '@/features/crud/crud-page';
import { api } from '@/lib/api/client';
import { DepartmentPermission, Item } from '@/types';

type Tab = 'positions' | 'employees';
type PermissionEmployee = Item & { fullName: string; employeeCode: string; position?: { name?: string } | null; departmentPermission?: DepartmentPermission | null };
const emptyPermission: DepartmentPermission = { canCreate: false, canUpdate: false, canDelete: false, canAssignPosition: false };

function PermissionRow({ departmentId, employee }: { departmentId: string; employee: PermissionEmployee }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [value, setValue] = useState<DepartmentPermission>(employee.departmentPermission ?? emptyPermission);
  const save = useMutation({
    mutationFn: () => api.patch(`/departments/${departmentId}/permissions/${employee.id}`, value),
    onSuccess: () => { toast.success(t('departmentDetail.permissions.saved')); void queryClient.invalidateQueries({ queryKey: ['department-permissions', departmentId] }); },
    onError: error => toast.error(error.message)
  });
  const controls: Array<{ key: keyof DepartmentPermission; label: string }> = [
    { key: 'canCreate', label: t('departmentDetail.permissions.create') },
    { key: 'canUpdate', label: t('departmentDetail.permissions.update') },
    { key: 'canDelete', label: t('departmentDetail.permissions.delete') },
    { key: 'canAssignPosition', label: t('departmentDetail.permissions.assignPosition') }
  ];
  return (
    <tr className="border-t border-slate-100">
      <td className="px-5 py-4"><p className="font-black text-slate-800">{employee.fullName}</p><p className="text-xs font-bold text-slate-400">{employee.employeeCode} · {employee.position?.name ?? '—'}</p></td>
      {controls.map(control => <td key={control.key} className="px-3 py-4 text-center"><label className="inline-flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={value[control.key]} onChange={event => setValue(current => ({ ...current, [control.key]: event.target.checked }))} className="h-4 w-4 accent-indigo-600" /><span className="lg:hidden">{control.label}</span></label></td>)}
      <td className="px-5 py-4 text-right"><button onClick={() => save.mutate()} disabled={save.isPending} className="btn btn-primary p-2.5 rounded-xl" title={t('common.actions.save')}><Save size={16} /></button></td>
    </tr>
  );
}

export function DepartmentDetail({ departmentId }: { departmentId: string }) {
  const t = useTranslations();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('positions');
  const department = useQuery({ queryKey: ['departments', departmentId], queryFn: () => api.get<Item>(`/departments/${departmentId}`) });
  const permissions = useQuery({ queryKey: ['department-permissions', departmentId], queryFn: () => api.get<PermissionEmployee[]>(`/departments/${departmentId}/permissions`), enabled: user?.role === 'ADMIN' && tab === 'employees' });
  if (department.isLoading) return <div className="min-h-96 grid place-items-center"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;
  if (department.isError || !department.data?.data) return <div className="card p-12 text-center"><p className="font-bold text-rose-600 mb-6">{t('departmentDetail.notFound')}</p><Link href="/departments" className="btn btn-secondary inline-flex">{t('departmentDetail.back')}</Link></div>;

  const data = department.data.data;
  const permission = user?.role === 'ADMIN' ? { canCreate: true, canUpdate: true, canDelete: true, canAssignPosition: true } : (user?.employee?.departmentPermission ?? emptyPermission);
  return (
    <section className="space-y-6 py-4">
      <Link href="/departments" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600"><ArrowLeft size={18} />{t('departmentDetail.back')}</Link>
      <div className="bg-white/85 border border-white/90 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white">
          <div className="flex items-start gap-4"><div className="p-3.5 rounded-2xl bg-white/15 border border-white/20"><Network size={28} /></div><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100 mb-1">{String(data.code ?? '')}</p><h1 className="text-3xl md:text-4xl font-black">{String(data.name ?? '')}</h1>{data.description && <p className="mt-2 text-indigo-100 font-medium">{String(data.description)}</p>}</div></div>
        </div>
        <div className="px-6 md:px-8 pt-5 border-b border-slate-200/70 bg-slate-50/60"><div className="flex gap-2" role="tablist" aria-label={t('departmentDetail.tabsLabel')}>
          <button role="tab" aria-selected={tab === 'positions'} onClick={() => setTab('positions')} className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm ${tab === 'positions' ? 'bg-white text-indigo-600 border border-b-white border-slate-200 -mb-px' : 'text-slate-500'}`}><BriefcaseBusiness size={18} />{t('departmentDetail.tabs.positions')}</button>
          <button role="tab" aria-selected={tab === 'employees'} onClick={() => setTab('employees')} className={`flex items-center gap-2 px-5 py-3 rounded-t-2xl font-black text-sm ${tab === 'employees' ? 'bg-white text-indigo-600 border border-b-white border-slate-200 -mb-px' : 'text-slate-500'}`}><Users size={18} />{t('departmentDetail.tabs.employees')}</button>
        </div></div>
        <div className="p-6 md:p-8">
          {tab === 'positions' ? <CrudPage config={configs.positions} queryParams={{ departmentId }} fixedValues={{ departmentId }} hiddenFields={['departmentId']} embedded canCreate={permission.canCreate} canEdit={permission.canUpdate} canDelete={permission.canDelete} /> : <div className="space-y-8"><CrudPage config={configs.employees} queryParams={{ departmentId }} fixedValues={{ departmentId }} hiddenFields={user?.role === 'EMPLOYEE' && !permission.canUpdate ? configs.employees.fields.filter(field => field.name !== 'positionId').map(field => field.name) : ['departmentId', ...(!permission.canAssignPosition ? ['positionId'] : [])]} embedded canCreate={permission.canCreate} canEdit={permission.canUpdate || permission.canAssignPosition} canDelete={permission.canDelete} />
            {user?.role === 'ADMIN' && <section className="rounded-3xl border border-indigo-100 bg-indigo-50/40 overflow-hidden"><div className="p-5 flex items-center gap-3 border-b border-indigo-100"><ShieldCheck className="text-indigo-600" /><div><h2 className="font-black text-slate-900">{t('departmentDetail.permissions.title')}</h2><p className="text-sm text-slate-500">{t('departmentDetail.permissions.description')}</p></div></div>{permissions.isLoading ? <div className="p-8 text-center font-bold text-indigo-600">{t('common.loading')}</div> : <div className="overflow-x-auto"><table className="w-full"><thead><tr className="text-xs uppercase tracking-wider text-indigo-500"><th className="px-5 py-3 text-left">{t('fields.fullName')}</th><th className="px-3 py-3">{t('departmentDetail.permissions.create')}</th><th className="px-3 py-3">{t('departmentDetail.permissions.update')}</th><th className="px-3 py-3">{t('departmentDetail.permissions.delete')}</th><th className="px-3 py-3">{t('departmentDetail.permissions.assignPosition')}</th><th /></tr></thead><tbody>{(permissions.data?.data ?? []).map(employee => <PermissionRow key={employee.id} departmentId={departmentId} employee={employee} />)}</tbody></table></div>}</section>}
          </div>}
        </div>
      </div>
    </section>
  );
}
