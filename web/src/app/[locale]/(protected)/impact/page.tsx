'use client';

import { useAuth } from '@/features/auth/auth-context';
import { AdminImpactView } from '@/features/impact/admin-impact-view';
import { EmployeeImpactView } from '@/features/impact/employee-impact-view';
import { redirect } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

export default function ImpactPage() {
  const { user, loading } = useAuth();
  const t = useTranslations();

  const locale = useLocale();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect({ href: '/login', locale });
    return null;
  }

  if (user.role === 'SUPER_ADMIN') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-slate-100 max-w-md">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Quyền truy cập bị từ chối</h2>
          <p className="text-slate-500">Tính năng này không dành cho vai trò quản trị viên hệ thống (Super Admin).</p>
        </div>
      </div>
    );
  }

  if (user.role === 'ADMIN') {
    return <AdminImpactView />;
  }

  return <EmployeeImpactView />;
}
