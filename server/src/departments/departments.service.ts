import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const departments = await this.prisma.department.findMany({
      where: { tenantId },
      orderBy: { level: 'asc' },
      include: {
        memberships: {
          include: { user: true }
        }
      }
    });

    // Convert flat list to tree
    return this.buildTree(departments);
  }

  private buildTree(list: any[], parentId: string | null = null): any[] {
    return list
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: this.buildTree(list, item.id),
      }));
  }

  async create(tenantId: string, data: { name: string; parentId?: string }) {
    let level = 0;
    if (data.parentId) {
      const parent = await this.prisma.department.findUnique({
        where: { id: data.parentId },
      });
      if (parent) {
        level = parent.level + 1;
        if (level > 2) {
          throw new ConflictException('조직도는 회사 > 부서 > 팀 (최대 3단계)까지만 생성할 수 있습니다.');
        }
      }
    }

    return this.prisma.department.create({
      data: {
        name: data.name,
        parentId: data.parentId,
        tenantId,
        level,
      },
    });
  }

  async update(tenantId: string, id: string, data: { name?: string; parentId?: string }) {
    const department = await this.prisma.department.findFirst({
      where: { id, tenantId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    let level = department.level;
    if (data.parentId && data.parentId !== department.parentId) {
      const parent = await this.prisma.department.findUnique({
        where: { id: data.parentId },
      });
      if (parent) {
        level = parent.level + 1;
        if (level > 2) {
          throw new ConflictException('조직도는 회사 > 부서 > 팀 (최대 3단계)까지만 생성/이동할 수 있습니다.');
        }
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        ...data,
        level,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department.level === 0) {
      throw new ConflictException('기본 조직(최상위 부서)은 삭제할 수 없습니다.');
    }

    const defaultDept = await this.prisma.department.findFirst({
      where: { tenantId, level: 0 }
    });

    if (defaultDept) {
      await this.prisma.tenantMembership.updateMany({
        where: { departmentId: id, tenantId },
        data: { departmentId: defaultDept.id }
      });

      await this.prisma.department.updateMany({
        where: { parentId: id, tenantId },
        data: { parentId: defaultDept.id }
      });
    }

    return this.prisma.department.deleteMany({
      where: { id, tenantId },
    });
  }

  async inviteUser(tenantId: string, data: { name: string; email: string; departmentId: string }) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const activeMembersCount = await this.prisma.tenantMembership.count({ where: { tenantId, status: 'ACTIVE' } });
    const pendingInvitesCount = await this.prisma.tenantMembership.count({ where: { tenantId, status: 'PENDING' } });

    if (activeMembersCount + pendingInvitesCount >= tenant.maxEmployees) {
      throw new ConflictException(`구독 플랜 제한: 워크스페이스 직원은 최대 ${tenant.maxEmployees}명까지만 초대할 수 있습니다. 결제 후 직원을 추가해 주세요.`);
    }

    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    
    if (user) {
      const existingMembership = await this.prisma.tenantMembership.findUnique({
        where: { userId_tenantId: { userId: user.id, tenantId } }
      });
      if (existingMembership) {
        throw new ConflictException('이미 소속되거나 초대된 사용자입니다.');
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: 'PENDING_USER',
        }
      });
    }

    return this.prisma.tenantMembership.create({
      data: {
        userId: user.id,
        tenantId,
        departmentId: data.departmentId,
        role: 'EMPLOYEE',
        status: 'PENDING',
      }
    });
  }

  async moveEmployee(tenantId: string, data: { employeeId: string; targetDepartmentId: string; isInvitation: boolean }) {
    return this.prisma.tenantMembership.updateMany({
      where: { id: data.employeeId, tenantId },
      data: { departmentId: data.targetDepartmentId }
    });
  }

  async updateEmployee(tenantId: string, id: string, data: any) {
    // Only updating TenantMembership fields since Invitation does not have HR info
    return this.prisma.tenantMembership.updateMany({
      where: { id, tenantId },
      data: {
        joinDate: data.joinDate ? new Date(data.joinDate) : null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        resignationDate: data.resignationDate ? new Date(data.resignationDate) : null,
        residentNumber: data.residentNumber,
        phone: data.phone,
        address: data.address,
        education: data.education,
        certifications: data.certifications,
        bankAccount: data.bankAccount,
      }
    });
  }

  async deleteEmployee(tenantId: string, id: string, isInvitation: boolean) {
    return this.prisma.tenantMembership.deleteMany({ where: { id, tenantId } });
  }
}
