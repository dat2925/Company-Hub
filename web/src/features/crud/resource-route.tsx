'use client';
import {useEffect} from 'react';
import {useAuth} from '@/features/auth/auth-context';
import {useRouter} from '@/i18n/navigation';
import {configs} from './config';
import {CrudPage} from './crud-page';
export function ResourceRoute({resource}:{resource:string}){const{user}=useAuth();const router=useRouter();const config=configs[resource];const allowed=user?.role==='SUPER_ADMIN'?resource==='companies':user?.role==='ADMIN'?resource!=='companies':['meetings','projects','issues','bulletins','notifications'].includes(resource);useEffect(()=>{if(user&&(!config||!allowed))router.replace('/dashboard')},[user,config,allowed,router]);if(!config||!allowed)return null;return <CrudPage config={config}/>}
