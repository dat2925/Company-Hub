import { DepartmentDetail } from '@/features/departments/department-detail';

export default async function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DepartmentDetail departmentId={id} />;
}
