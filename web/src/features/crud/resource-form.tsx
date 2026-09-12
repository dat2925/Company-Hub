'use client';
import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Resolver,useForm} from 'react-hook-form';
import {z} from 'zod';
import {ResourceConfig} from './config';
import {Item} from '@/types';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {api} from '@/lib/api/client';

const asInput=(value:unknown,type?:string)=>{
  if(value==null)return'';
  if((type==='date'||type==='datetime-local')&&typeof value==='string')return type==='date'?value.slice(0,10):value.slice(0,16);
  return String(value);
};

export function ResourceForm({config,item,onSubmit,onCancel,busy}:{config:ResourceConfig;item?:Item;onSubmit:(data:Record<string,string>)=>void;onCancel:()=>void;busy:boolean}){
  const t=useTranslations();
  const needsDepartments=config.fields.some(f=>f.lookup==='departments');
  const needsPositions=config.fields.some(f=>f.lookup==='positions');
  const needsProjects=config.fields.some(f=>f.lookup==='projects');
  const needsEmployees=config.fields.some(f=>f.lookup==='employees');

  const departments=useQuery({queryKey:['department-options'],queryFn:()=>api.get<Item[]>('/departments?page=1&pageSize=100'),enabled:needsDepartments});
  const positions=useQuery({queryKey:['position-options'],queryFn:()=>api.get<Item[]>('/positions?page=1&pageSize=100'),enabled:needsPositions});
  const projects=useQuery({queryKey:['project-options'],queryFn:()=>api.get<Item[]>('/projects?page=1&pageSize=100'),enabled:needsProjects});
  const employees=useQuery({queryKey:['employee-options'],queryFn:()=>api.get<Item[]>('/employees/options/list'),enabled:needsEmployees});

  const shape:Record<string,z.ZodType<string>>={};
  for(const f of config.fields) shape[f.name]=f.required?z.string().min(1,t('validation.required')):z.string();
  const schema=z.object(shape);
  const defaults=Object.fromEntries(config.fields.map(f=>[f.name,asInput(item?.[f.name],f.type)]));
  const resolver=zodResolver(schema) as Resolver<Record<string,string>>;

  const{register,handleSubmit,watch,setValue,formState:{errors}}=useForm<Record<string,string>>({resolver,defaultValues:defaults});
  const departmentId=watch('departmentId');

  const lookupOptions=(lookup?:'departments'|'positions'|'projects'|'employees')=>
    lookup==='departments'?(departments.data?.data??[])
    :lookup==='positions'?(positions.data?.data??[]).filter(position=>position.departmentId===departmentId)
    :lookup==='projects'?(projects.data?.data??[])
    :lookup==='employees'?(employees.data?.data??[]):[];

  return (
    <form onSubmit={handleSubmit(values=>onSubmit(Object.fromEntries(Object.entries(values).filter(([,v])=>v!==''))))}>
      <div className="grid md:grid-cols-2 gap-4">
        {config.fields.map(f=>{
          const registration=register(f.name);
          return (
            <div key={f.name} className={f.type==='textarea'?'md:col-span-2':''}>
              <label className="label text-slate-700">{t(`fields.${f.name}`)}</label>
              {f.type==='textarea' ? (
                <textarea className="input min-h-28 resize-y" {...registration}/>
              ) : f.type==='select' ? (
                <select 
                  className="input cursor-pointer" 
                  {...registration} 
                  onChange={event=>{
                    void registration.onChange(event);
                    if(f.name==='departmentId') setValue('positionId','');
                  }}
                >
                  <option value="">{t('common.select')}</option>
                  {f.lookup ? lookupOptions(f.lookup).map(option=>(
                    <option key={option.id} value={option.id}>
                      {String(f.lookup==='employees'?option.fullName:option.name)}
                      {(option.code||option.employeeCode)?` (${String(option.code??option.employeeCode)})`:''}
                    </option>
                  )) : f.options?.map(o=>(
                    <option key={o} value={o}>{t(`statuses.${o}`)}</option>
                  ))}
                </select>
              ) : (
                <Input type={f.type??'text'} {...registration}/>
              )}
              {errors[f.name] && <p className="error">{String(errors[f.name]?.message)}</p>}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.actions.cancel')}
        </Button>
        <Button disabled={busy} className="btn-primary">
          {busy?t('common.saving'):t('common.actions.save')}
        </Button>
      </div>
    </form>
  );
}
