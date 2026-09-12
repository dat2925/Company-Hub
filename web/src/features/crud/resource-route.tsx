'use client';
import {useEffect} from 'react';
import {useAuth} from '@/features/auth/auth-context';
import {useRouter} from '@/i18n/navigation';
import {configs} from './config';
import {CrudPage} from './crud-page';
export function ResourceRoute({resource}:{resource:string}){const{user}=useAuth();const router=useRouter();const config=configs[resource];const p=user?.employee?.departmentPermission;const hasDepartmentPermission=Boolean(p&&(p.canCreate||p.canUpdate||p.canDelete||p.canAssignPosition));const allowed=user?.role==='SUPER_ADMIN'?resource==='companies':user?.role==='ADMIN'?resource!=='companies'&&resource!=='issues'&&resource!=='positions':['meetings','projects','bulletins','notifications'].includes(resource)||(resource==='departments'&&hasDepartmentPermission);useEffect(()=>{if(user&&(!config||!allowed))router.replace('/dashboard')},[user,config,allowed,router]);if(!config||!allowed)return null;const departmentReadOnly=resource==='departments'&&user?.role==='EMPLOYEE';return <CrudPage config={config} canCreate={!departmentReadOnly} canEdit={!departmentReadOnly} canDelete={!departmentReadOnly}/>}
