export type Role='SUPER_ADMIN'|'ADMIN'|'EMPLOYEE';
export interface DepartmentPermission{canCreate:boolean;canUpdate:boolean;canDelete:boolean;canAssignPosition:boolean}
export interface User{id:string;email:string;role:Role;companyId:string|null;employee?:{fullName:string;departmentId?:string|null;departmentPermission?:DepartmentPermission|null;department?:{name:string}|null;position?:{name:string}|null}|null;company?:{name:string}|null}
export interface Item{ id:string; [key:string]:string|number|boolean|null|undefined|object }
export interface Field{name:string;type?:'text'|'email'|'textarea'|'date'|'datetime-local'|'select'|'password';required?:boolean;options?:string[];lookup?:'departments'|'positions'|'projects'|'employees'}
