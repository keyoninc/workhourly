import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  findAll(@TenantId() tenantId: string) {
    return this.departmentsService.findAll(tenantId);
  }

  @Post()
  create(@TenantId() tenantId: string, @Body() data: { name: string; parentId?: string }) {
    return this.departmentsService.create(tenantId, data);
  }

  @Post('invite')
  inviteUser(
    @TenantId() tenantId: string,
    @Body() data: { name: string; email: string; departmentId: string },
  ) {
    return this.departmentsService.inviteUser(tenantId, data);
  }

  @Patch('move-employee')
  moveEmployee(
    @TenantId() tenantId: string,
    @Body() data: { employeeId: string; targetDepartmentId: string; isInvitation: boolean },
  ) {
    return this.departmentsService.moveEmployee(tenantId, data);
  }

  @Patch('employee/:id')
  updateEmployee(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.departmentsService.updateEmployee(tenantId, id, data);
  }

  @Delete('employee/:id')
  deleteEmployee(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Query('isInvitation') isInvitation: string,
  ) {
    return this.departmentsService.deleteEmployee(tenantId, id, isInvitation === 'true');
  }

  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() data: { name?: string; parentId?: string },
  ) {
    return this.departmentsService.update(tenantId, id, data);
  }

  @Delete(':id')
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.departmentsService.remove(tenantId, id);
  }
}
