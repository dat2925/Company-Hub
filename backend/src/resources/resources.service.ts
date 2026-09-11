import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PaginationDto, pageMeta } from '../common/pagination.dto';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBulletinDto, CreateDepartmentDto, CreateEmployeeDto, CreateIssueDto, CreateMeetingDto, CreateNotificationDto, CreatePositionDto, CreateProjectDto, UpdateBulletinDto, UpdateDepartmentDto, UpdateEmployeeDto, UpdateIssueDto, UpdateMeetingDto, UpdateNotificationDto, UpdatePositionDto, UpdateProjectDto } from './dto/resource.dto';

const paging = (q: PaginationDto) => ({ skip: (q.page - 1) * q.pageSize, take: q.pageSize });
@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}
  async list(u: AuthUser, q: PaginationDto) { const where: Prisma.DepartmentWhereInput = { companyId: u.companyId!, ...(q.search && { OR: [{ name: { contains: q.search, mode: 'insensitive' } }, { code: { contains: q.search, mode: 'insensitive' } }] }) }; const [data,total]=await this.prisma.$transaction([this.prisma.department.findMany({where,...paging(q),orderBy:{createdAt:'desc'}}),this.prisma.department.count({where})]); return {data,meta:pageMeta(q.page,q.pageSize,total)}; }
  async get(u: AuthUser,id:string){const row=await this.prisma.department.findFirst({where:{id,companyId:u.companyId!}});if(!row)throw new NotFoundException('Department not found');return row;}
  create(u:AuthUser,d:CreateDepartmentDto){return this.prisma.department.create({data:{...d,code:d.code.toUpperCase(),companyId:u.companyId!}});}
  async update(u:AuthUser,id:string,d:UpdateDepartmentDto){await this.get(u,id);return this.prisma.department.update({where:{id},data:{...d,code:d.code?.toUpperCase()}});}
  async remove(u:AuthUser,id:string){await this.get(u,id);return this.prisma.department.delete({where:{id}});}
}

@Injectable()
export class PositionsService {
  constructor(private prisma:PrismaService){}
  async list(u:AuthUser,q:PaginationDto){const where:Prisma.PositionWhereInput={companyId:u.companyId!,...(q.search&&{OR:[{name:{contains:q.search,mode:'insensitive'}},{code:{contains:q.search,mode:'insensitive'}}]})};const[data,total]=await this.prisma.$transaction([this.prisma.position.findMany({where,...paging(q),include:{department:true},orderBy:{createdAt:'desc'}}),this.prisma.position.count({where})]);return{data,meta:pageMeta(q.page,q.pageSize,total)};}
  async get(u:AuthUser,id:string){const row=await this.prisma.position.findFirst({where:{id,companyId:u.companyId!},include:{department:true}});if(!row)throw new NotFoundException('Position not found');return row;}
  private async checkDepartment(companyId:string,departmentId:string){if(!await this.prisma.department.findFirst({where:{id:departmentId,companyId}}))throw new BadRequestException('Invalid department');}
  async create(u:AuthUser,d:CreatePositionDto){await this.checkDepartment(u.companyId!,d.departmentId);return this.prisma.position.create({data:{...d,code:d.code.toUpperCase(),companyId:u.companyId!},include:{department:true}});}
  async update(u:AuthUser,id:string,d:UpdatePositionDto){const current=await this.get(u,id);await this.checkDepartment(u.companyId!,d.departmentId??current.departmentId);return this.prisma.position.update({where:{id},data:{...d,code:d.code?.toUpperCase()},include:{department:true}});}
  async remove(u:AuthUser,id:string){await this.get(u,id);return this.prisma.position.delete({where:{id}});}
}

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}
  async list(u:AuthUser,q:PaginationDto){const where:Prisma.EmployeeWhereInput={companyId:u.companyId!,...(q.search&&{OR:[{fullName:{contains:q.search,mode:'insensitive'}},{employeeCode:{contains:q.search,mode:'insensitive'}},{email:{contains:q.search,mode:'insensitive'}}]})};const[data,total]=await this.prisma.$transaction([this.prisma.employee.findMany({where,...paging(q),include:{department:true,position:true,user:{select:{id:true,isActive:true}}},orderBy:{createdAt:'desc'}}),this.prisma.employee.count({where})]);return{data,meta:pageMeta(q.page,q.pageSize,total)};}
  async get(u:AuthUser,id:string){const row=await this.prisma.employee.findFirst({where:{id,companyId:u.companyId!},include:{department:true,position:true,user:{select:{id:true,isActive:true}}}});if(!row)throw new NotFoundException('Employee not found');return row;}
  options(u:AuthUser){return this.prisma.employee.findMany({where:{companyId:u.companyId!},select:{id:true,fullName:true,employeeCode:true},orderBy:{fullName:'asc'}});}
  private async checkAssignment(companyId:string,departmentId?:string,positionId?:string){if(departmentId&&!await this.prisma.department.findFirst({where:{id:departmentId,companyId}}))throw new BadRequestException('Invalid department');if(positionId){if(!departmentId)throw new BadRequestException('Department is required when selecting a position');const position=await this.prisma.position.findFirst({where:{id:positionId,companyId,departmentId}});if(!position)throw new BadRequestException('Position does not belong to the selected department');}}
  async create(u:AuthUser,d:CreateEmployeeDto){await this.checkAssignment(u.companyId!,d.departmentId,d.positionId);const{password,...employee}=d;return this.prisma.$transaction(async tx=>{let userId:string|undefined;if(password){const account=await tx.user.create({data:{companyId:u.companyId!,email:d.email.toLowerCase(),passwordHash:await argon2.hash(password),role:'EMPLOYEE'}});userId=account.id;}return tx.employee.create({data:{...employee,email:d.email.toLowerCase(),employeeCode:d.employeeCode.toUpperCase(),companyId:u.companyId!,userId},include:{department:true,position:true}});});}
  async update(u:AuthUser,id:string,d:UpdateEmployeeDto){const current=await this.get(u,id);await this.checkAssignment(u.companyId!,d.departmentId??current.departmentId??undefined,d.positionId??current.positionId??undefined);const{password,...employee}=d;if(password&&!current.userId)throw new BadRequestException('Create a linked account when creating the employee');if(password&&current.userId)await this.prisma.user.update({where:{id:current.userId},data:{passwordHash:await argon2.hash(password)}});return this.prisma.employee.update({where:{id},data:{...employee,email:d.email?.toLowerCase(),employeeCode:d.employeeCode?.toUpperCase()},include:{department:true,position:true}});}
  async remove(u:AuthUser,id:string){const row=await this.get(u,id);return this.prisma.$transaction(async tx=>{await tx.employee.delete({where:{id}});if(row.userId)await tx.user.update({where:{id:row.userId},data:{isActive:false}});return row;});}
}

@Injectable()
export class MeetingsService {
  constructor(private prisma:PrismaService){}
  async list(u:AuthUser,q:PaginationDto){const where:Prisma.MeetingWhereInput={companyId:u.companyId!,...(q.search&&{title:{contains:q.search,mode:'insensitive'}})};const[data,total]=await this.prisma.$transaction([this.prisma.meeting.findMany({where,...paging(q),orderBy:{startAt:'desc'}}),this.prisma.meeting.count({where})]);return{data,meta:pageMeta(q.page,q.pageSize,total)};}
  async get(u:AuthUser,id:string){const row=await this.prisma.meeting.findFirst({where:{id,companyId:u.companyId!}});if(!row)throw new NotFoundException('Meeting not found');return row;}
  create(u:AuthUser,d:CreateMeetingDto){if(d.endAt<=d.startAt)throw new BadRequestException('End time must be after start time');return this.prisma.meeting.create({data:{...d,companyId:u.companyId!,organizerId:u.id}});}
  async update(u:AuthUser,id:string,d:UpdateMeetingDto){const current=await this.get(u,id);if((d.endAt??current.endAt)<=(d.startAt??current.startAt))throw new BadRequestException('End time must be after start time');return this.prisma.meeting.update({where:{id},data:d});}
  async remove(u:AuthUser,id:string){await this.get(u,id);return this.prisma.meeting.delete({where:{id}});}
}

@Injectable()
export class ProjectsService {
  constructor(private prisma:PrismaService){}
  async list(u:AuthUser,q:PaginationDto){const where:Prisma.ProjectWhereInput={companyId:u.companyId!,...(q.search&&{OR:[{name:{contains:q.search,mode:'insensitive'}},{code:{contains:q.search,mode:'insensitive'}}]})};const[data,total]=await this.prisma.$transaction([this.prisma.project.findMany({where,...paging(q),orderBy:{createdAt:'desc'}}),this.prisma.project.count({where})]);return{data,meta:pageMeta(q.page,q.pageSize,total)};}
  async get(u:AuthUser,id:string){const row=await this.prisma.project.findFirst({where:{id,companyId:u.companyId!}});if(!row)throw new NotFoundException('Project not found');return row;}
  create(u:AuthUser,d:CreateProjectDto){return this.prisma.project.create({data:{...d,code:d.code.toUpperCase(),companyId:u.companyId!,createdById:u.id}});}
  async update(u:AuthUser,id:string,d:UpdateProjectDto){await this.get(u,id);return this.prisma.project.update({where:{id},data:{...d,code:d.code?.toUpperCase()}});}
  async remove(u:AuthUser,id:string){await this.get(u,id);return this.prisma.project.delete({where:{id}});}
}

@Injectable()
export class IssuesService {
  constructor(private prisma:PrismaService){}
  private include={project:{select:{id:true,name:true,code:true}},assignee:{select:{id:true,fullName:true,employeeCode:true}},createdBy:{select:{id:true,email:true}}} as const;
  async list(u:AuthUser,q:PaginationDto){const where:Prisma.IssueWhereInput={companyId:u.companyId!,...(q.search&&{OR:[{title:{contains:q.search,mode:'insensitive'}},{description:{contains:q.search,mode:'insensitive'}}]})};const[data,total]=await this.prisma.$transaction([this.prisma.issue.findMany({where,...paging(q),include:this.include,orderBy:{createdAt:'desc'}}),this.prisma.issue.count({where})]);return{data,meta:pageMeta(q.page,q.pageSize,total)};}
  async get(u:AuthUser,id:string){const row=await this.prisma.issue.findFirst({where:{id,companyId:u.companyId!},include:this.include});if(!row)throw new NotFoundException('Issue not found');return row;}
  private async checkLinks(companyId:string,projectId:string,assigneeId?:string){const[project,assignee]=await Promise.all([this.prisma.project.findFirst({where:{id:projectId,companyId},select:{id:true}}),assigneeId?this.prisma.employee.findFirst({where:{id:assigneeId,companyId},select:{id:true}}):Promise.resolve(null)]);if(!project)throw new BadRequestException('Invalid project');if(assigneeId&&!assignee)throw new BadRequestException('Invalid assignee');}
  async create(u:AuthUser,d:CreateIssueDto){await this.checkLinks(u.companyId!,d.projectId,d.assigneeId);return this.prisma.issue.create({data:{...d,companyId:u.companyId!,createdById:u.id},include:this.include});}
  async update(u:AuthUser,id:string,d:UpdateIssueDto){const current=await this.get(u,id);await this.checkLinks(u.companyId!,d.projectId??current.projectId,d.assigneeId??current.assigneeId??undefined);return this.prisma.issue.update({where:{id},data:d,include:this.include});}
  async remove(u:AuthUser,id:string){await this.get(u,id);return this.prisma.issue.delete({where:{id}});}
}

@Injectable()
export class BulletinsService {
  constructor(private prisma:PrismaService){}
  async list(u:AuthUser,q:PaginationDto){const where:Prisma.BulletinWhereInput={companyId:u.companyId!,...(q.search&&{OR:[{title:{contains:q.search,mode:'insensitive'}},{content:{contains:q.search,mode:'insensitive'}}]})};const[data,total]=await this.prisma.$transaction([this.prisma.bulletin.findMany({where,...paging(q),orderBy:{createdAt:'desc'}}),this.prisma.bulletin.count({where})]);return{data,meta:pageMeta(q.page,q.pageSize,total)};}
  async get(u:AuthUser,id:string){const row=await this.prisma.bulletin.findFirst({where:{id,companyId:u.companyId!}});if(!row)throw new NotFoundException('Bulletin not found');return row;}
  create(u:AuthUser,d:CreateBulletinDto){return this.prisma.bulletin.create({data:{...d,companyId:u.companyId!,createdById:u.id}});}
  async update(u:AuthUser,id:string,d:UpdateBulletinDto){await this.get(u,id);return this.prisma.bulletin.update({where:{id},data:d});}
  async remove(u:AuthUser,id:string){await this.get(u,id);return this.prisma.bulletin.delete({where:{id}});}
}

@Injectable()
export class NotificationsService {
  constructor(private prisma:PrismaService){}
  async list(u:AuthUser,q:PaginationDto){const where:Prisma.NotificationWhereInput={companyId:u.companyId!,...(q.search&&{OR:[{title:{contains:q.search,mode:'insensitive'}},{message:{contains:q.search,mode:'insensitive'}}]})};const[data,total]=await this.prisma.$transaction([this.prisma.notification.findMany({where,...paging(q),orderBy:{createdAt:'desc'}}),this.prisma.notification.count({where})]);return{data,meta:pageMeta(q.page,q.pageSize,total)};}
  async get(u:AuthUser,id:string){const row=await this.prisma.notification.findFirst({where:{id,companyId:u.companyId!}});if(!row)throw new NotFoundException('Notification not found');return row;}
  create(u:AuthUser,d:CreateNotificationDto){return this.prisma.notification.create({data:{...d,companyId:u.companyId!,createdById:u.id}});}
  async update(u:AuthUser,id:string,d:UpdateNotificationDto){await this.get(u,id);return this.prisma.notification.update({where:{id},data:d});}
  async remove(u:AuthUser,id:string){await this.get(u,id);return this.prisma.notification.delete({where:{id}});}
}
