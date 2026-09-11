import * as React from 'react';
import {cn} from '@/lib/utils';
type Props=React.ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'default'|'secondary'|'destructive'};
export function Button({className,variant='default',...props}:Props){return <button className={cn('btn',variant==='default'&&'btn-primary',variant==='secondary'&&'btn-secondary',variant==='destructive'&&'btn-danger',className)} {...props}/>}
