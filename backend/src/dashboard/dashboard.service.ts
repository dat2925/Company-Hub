import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class DashboardService {
  constructor(private prisma:PrismaService){}
  async get(u:AuthUser){
    if(u.role===Role.SUPER_ADMIN){const [totalCompanies,activeCompanies,recentCompanies]=await this.prisma.$transaction([this.prisma.company.count(),this.prisma.company.count({where:{status:'ACTIVE'}}),this.prisma.company.findMany({take:5,orderBy:{createdAt:'desc'}})]);return{totalCompanies,activeCompanies,recentCompanies};}
    const companyId=u.companyId!;
    const [totalProjects,upcomingMeetings,recentBulletins,recentNotifications]=await this.prisma.$transaction([this.prisma.project.count({where:{companyId}}),this.prisma.meeting.count({where:{companyId,startAt:{gte:new Date()},status:'SCHEDULED'}}),this.prisma.bulletin.findMany({where:{companyId},take:5,orderBy:{createdAt:'desc'}}),this.prisma.notification.findMany({where:{companyId},take:5,orderBy:{createdAt:'desc'}})]);
    if(u.role===Role.EMPLOYEE)return{totalProjects,upcomingMeetings,recentBulletins,recentNotifications};
    const [totalDepartments,totalPositions,totalEmployees,totalBulletins,totalNotifications]=await this.prisma.$transaction([this.prisma.department.count({where:{companyId}}),this.prisma.position.count({where:{companyId}}),this.prisma.employee.count({where:{companyId}}),this.prisma.bulletin.count({where:{companyId}}),this.prisma.notification.count({where:{companyId}})]);
    return{totalDepartments,totalPositions,totalEmployees,totalProjects,upcomingMeetings,totalBulletins,totalNotifications,recentBulletins,recentNotifications};
  }
}
