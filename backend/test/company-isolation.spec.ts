import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { BulletinsService, ProjectsService } from '../src/resources/resources.service';
const companyA={id:'user-a',email:'a@example.com',role:Role.ADMIN,companyId:'company-a'};
describe('Tenant isolation',()=>{
  it('scopes project lookup to currentUser.companyId',async()=>{const findFirst=jest.fn().mockResolvedValue(null);const service=new ProjectsService({project:{findFirst}} as never);await expect(service.get(companyA,'project-b')).rejects.toBeInstanceOf(NotFoundException);expect(findFirst).toHaveBeenCalledWith({where:{id:'project-b',companyId:'company-a'}})});
  it('does not update a bulletin from another company',async()=>{const findFirst=jest.fn().mockResolvedValue(null);const update=jest.fn();const service=new BulletinsService({bulletin:{findFirst,update}} as never);await expect(service.update(companyA,'bulletin-b',{title:'Blocked'})).rejects.toBeInstanceOf(NotFoundException);expect(update).not.toHaveBeenCalled()});
});
