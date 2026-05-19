import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@Controller('mail')
@UseGuards(JwtAuthGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async sendMail(@TenantId() tenantId: string, @Request() req: any, @Body() body: any) {
    return this.mailService.sendMail(tenantId, req.user.id, body);
  }

  @Get('inbox')
  async getInbox(@TenantId() tenantId: string, @Request() req: any) {
    return this.mailService.getInbox(tenantId, req.user.id);
  }

  @Get('sent')
  async getSent(@TenantId() tenantId: string, @Request() req: any) {
    return this.mailService.getSent(tenantId, req.user.id);
  }

  @Patch(':id/read')
  async markAsRead(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.mailService.markAsRead(tenantId, id);
  }
}
