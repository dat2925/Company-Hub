import {redirect} from '@/i18n/navigation';
export default async function Home({params}:{params:Promise<{locale:'vi'|'en'}>}){const{locale}=await params;redirect({href:'/dashboard',locale})}
