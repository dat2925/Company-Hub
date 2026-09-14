import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
const prisma = new PrismaClient();
const password = 'Demo@123';

async function upsertUser(email:string, role:Role, companyId:string|null, fullName?:string, employeeCode?:string){
  const user=await prisma.user.upsert({where:{email},update:{companyId,role,isActive:true},create:{email,companyId,role,passwordHash:await argon2.hash(password)}});
  if(companyId&&fullName&&employeeCode)await prisma.employee.upsert({where:{companyId_employeeCode:{companyId,employeeCode}},update:{userId:user.id,fullName,email},create:{companyId,userId:user.id,employeeCode,fullName,email}});
  return user;
}
async function main(){
  if(process.env.SEED_IF_EMPTY==='true'&&await prisma.company.count()>0)return;
  await upsertUser('superadmin@system.com',Role.SUPER_ADMIN,null);
  for(let i=1;i<=3;i++){
    const company=await prisma.company.upsert({where:{code:`COMP${i}`},update:{},create:{name:`Demo Company ${i}`,code:`COMP${i}`,email:`contact@company${i}.com`,phone:`090000000${i}`,address:`${i} Business Street, Ho Chi Minh City`}});
    const admin=await upsertUser(`admin@company${i}.com`,Role.ADMIN,company.id,`Company ${i} Admin`,`ADM00${i}`);
    const employee=await upsertUser(`employee@company${i}.com`,Role.EMPLOYEE,company.id,`Company ${i} Employee`,`EMP00${i}`);
    const department=await prisma.department.upsert({where:{companyId_code:{companyId:company.id,code:'OPS'}},update:{},create:{companyId:company.id,code:'OPS',name:'Operations',description:'Daily operations'}});
    const position=await prisma.position.upsert({where:{companyId_code:{companyId:company.id,code:'STAFF'}},update:{departmentId:department.id},create:{companyId:company.id,departmentId:department.id,code:'STAFF',name:'Staff',description:'Operations staff'}});
    await prisma.employee.updateMany({where:{companyId:company.id,employeeCode:`EMP00${i}`},data:{departmentId:department.id,positionId:position.id}});
    const project=await prisma.project.upsert({where:{companyId_code:{companyId:company.id,code:'PRJ-DEMO'}},update:{},create:{companyId:company.id,name:'Demo Project',code:'PRJ-DEMO',description:'Seeded project',createdById:admin.id,status:'ACTIVE',startDate:new Date()}});
    const typescript=await prisma.skill.upsert({where:{companyId_code:{companyId:company.id,code:'TYPESCRIPT'}},update:{},create:{companyId:company.id,code:'TYPESCRIPT',name:'TypeScript',category:'Engineering'}});
    const communication=await prisma.skill.upsert({where:{companyId_code:{companyId:company.id,code:'COMMUNICATION'}},update:{},create:{companyId:company.id,code:'COMMUNICATION',name:'Communication',category:'Soft skills'}});
    const employeeProfile=await prisma.employee.findUnique({where:{userId:employee.id},select:{id:true}});
    if(employeeProfile){
      await prisma.employeeSkill.upsert({where:{employeeId_skillId:{employeeId:employeeProfile.id,skillId:typescript.id}},update:{},create:{companyId:company.id,employeeId:employeeProfile.id,skillId:typescript.id,level:3,yearsExperience:2,source:'SELF_DECLARED'}});
      await prisma.employeeSkill.upsert({where:{employeeId_skillId:{employeeId:employeeProfile.id,skillId:communication.id}},update:{},create:{companyId:company.id,employeeId:employeeProfile.id,skillId:communication.id,level:4,yearsExperience:3,source:'MANAGER_VERIFIED',verifiedAt:new Date()}});
    }
    await prisma.projectSkillRequirement.upsert({where:{projectId_skillId:{projectId:project.id,skillId:typescript.id}},update:{},create:{companyId:company.id,projectId:project.id,skillId:typescript.id,minimumLevel:4,weight:3,isRequired:true}});
    await prisma.projectSkillRequirement.upsert({where:{projectId_skillId:{projectId:project.id,skillId:communication.id}},update:{},create:{companyId:company.id,projectId:project.id,skillId:communication.id,minimumLevel:3,weight:1,isRequired:false}});
    const meeting=await prisma.meeting.findFirst({where:{companyId:company.id,title:'Weekly sync'}});if(!meeting)await prisma.meeting.create({data:{companyId:company.id,title:'Weekly sync',description:'Team update',organizerId:employee.id,startAt:new Date(Date.now()+86400000),endAt:new Date(Date.now()+90000000)}});
    const bulletin=await prisma.bulletin.findFirst({where:{companyId:company.id,title:'Welcome'}});if(!bulletin)await prisma.bulletin.create({data:{companyId:company.id,title:'Welcome',content:'Welcome to the company portal.',createdById:admin.id,publishedAt:new Date()}});
    const notification=await prisma.notification.findFirst({where:{companyId:company.id,title:'Portal ready'}});if(!notification)await prisma.notification.create({data:{companyId:company.id,title:'Portal ready',message:'The company management portal is ready to use.',createdById:admin.id}});
  }
}
main().finally(()=>prisma.$disconnect());
