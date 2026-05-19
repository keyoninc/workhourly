import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  async getTenantInfo(@TenantId() tenantId: string) {
    return this.tenantsService.findOne(tenantId);
  }

  @Patch('me')
  async updateTenantInfo(@TenantId() tenantId: string, @Body() body: any) {
    return this.tenantsService.update(tenantId, body);
  }
}
