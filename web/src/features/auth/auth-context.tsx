'use client';
import {useQueryClient} from '@tanstack/react-query';
import {createContext,useContext,useEffect,useState} from 'react';
import {usePathname,useRouter} from '@/i18n/navigation';
import {api} from '@/lib/api/client';
import {User} from '@/types';

type AuthContextValue={user:User|null;loading:boolean;login:(email:string,password:string)=>Promise<void>;logout:()=>Promise<void>;reload:()=>Promise<void>};
const AuthContext=createContext<AuthContextValue|null>(null);

export function AuthProvider({children}:{children:React.ReactNode}){
  const[user,setUser]=useState<User|null>(null);
  const[loading,setLoading]=useState(true);
  const router=useRouter();
  const path=usePathname();
  const queryClient=useQueryClient();
  const reload=async()=>{try{const response=await api.get<User>('/auth/me');setUser(response.data)}catch{setUser(null)}finally{setLoading(false)}};
  useEffect(()=>{api.get<User>('/auth/me').then(response=>setUser(response.data)).catch(()=>setUser(null)).finally(()=>setLoading(false))},[]);
  useEffect(()=>{if(!loading&&!user&&path!=='/login')router.replace('/login')},[loading,user,path,router]);
  const login=async(email:string,password:string)=>{const response=await api.post<{user:User;accessToken:string;refreshToken:string}>('/auth/login',{email,password});api.tokens.set('accessToken',response.data.accessToken);api.tokens.set('refreshToken',response.data.refreshToken);queryClient.clear();setUser(response.data.user);router.replace('/dashboard')};
  const logout=async()=>{const refreshToken=api.tokens.get('refreshToken');try{if(refreshToken)await api.post('/auth/logout',{refreshToken})}finally{api.tokens.clear();queryClient.clear();setUser(null);router.replace('/login')}};
  return <AuthContext.Provider value={{user,loading,login,logout,reload}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>{const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider missing');return value};
