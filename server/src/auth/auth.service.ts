import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(data: any) {
    const { email, password, name } = data;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      if (existingUser.password === 'PENDING_USER') {
        const user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { password: hashedPassword, name }
        });
        return { user: { id: user.id, email: user.email, name: user.name } };
      }
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return {
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        memberships: {
          include: { tenant: true }
        } 
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      memberships: user.memberships,
    };
  }

  async registerTenant(userId: string, data: any) {
    const { name, businessNumber, representativeName, businessLicenseUrl } = data;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { role: 'ADMIN' }
        }
      }
    });

    if (!user) throw new UnauthorizedException('User not found');

    if (user.memberships.length >= user.maxWorkspaces) {
      throw new ConflictException(`구독 플랜 제한: 워크스페이스는 최대 ${user.maxWorkspaces}개까지만 개설할 수 있습니다.`);
    }

    const existingTenant = await this.prisma.tenant.findUnique({
      where: { businessNumber },
    });

    if (existingTenant) {
      throw new ConflictException('이미 등록된 사업장입니다.');
    }

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          businessNumber,
          representativeName,
          businessLicenseUrl,
          status: 'ACTIVE', // For now, auto-approve
        },
      });

      const dept = await tx.department.create({
        data: {
          name,
          tenantId: tenant.id,
          level: 0,
        },
      });

      const membership = await tx.tenantMembership.create({
        data: {
          userId,
          tenantId: tenant.id,
          role: 'ADMIN',
          departmentId: dept.id,
        },
        include: { tenant: true }
      });

      return membership;
    });
  }

  async joinTenant(userId: string, businessNumber: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { businessNumber },
    });

    if (!tenant) {
      throw new UnauthorizedException('유효하지 않은 초대 코드(사업자번호)입니다.');
    }

    const existingMembership = await this.prisma.tenantMembership.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId: tenant.id,
        }
      }
    });

    if (existingMembership) {
      if (existingMembership.status === 'PENDING') {
        return this.prisma.tenantMembership.update({
          where: { id: existingMembership.id },
          data: { status: 'ACTIVE' },
          include: { tenant: true }
        });
      }
      throw new ConflictException('이미 소속된 조직입니다.');
    }

    const defaultDepartment = await this.prisma.department.findFirst({
      where: { tenantId: tenant.id, level: 0 },
    });

    const membership = await this.prisma.tenantMembership.create({
      data: {
        userId,
        tenantId: tenant.id,
        role: 'EMPLOYEE',
        departmentId: defaultDepartment?.id,
      },
      include: { tenant: true }
    });

    return membership;
  }
}
