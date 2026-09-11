import {ResourceRoute} from '@/features/crud/resource-route';
export default async function ResourcePage({params}:{params:Promise<{resource:string}>}){const{resource}=await params;return <ResourceRoute resource={resource}/>}
