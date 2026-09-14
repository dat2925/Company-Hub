'use client';
import { useAuth } from '@/features/auth/auth-context';
import { EmployeeArcadeView } from '@/features/arcade/employee-arcade-view';
import { AdminArcadeView } from '@/features/arcade/admin-arcade-view';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export default function ArcadePage() {
  const { user, loading } = useAuth();
  const t = useTranslations();

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
        <p className="text-slate-500 font-bold">{t('common.loading')}</p>
      </div>
    );
  }

  if (!user) return null;

  // Render based on role
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return <AdminArcadeView />;
  }

  return <EmployeeArcadeView />;
}
