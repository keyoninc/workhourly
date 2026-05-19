import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailService {
  constructor(private prisma: PrismaService) {}

  async sendMail(tenantId: string, senderId: string, data: any) {
    const { recipientEmail, subject, content } = data;
    
    // Find recipient user
    const recipient = await this.prisma.user.findUnique({
      where: { email: recipientEmail }
    });

    return this.prisma.mail.create({
      data: {
        tenantId,
        senderId,
        recipientEmail,
        recipientId: recipient ? recipient.id : null,
        subject,
        content
      }
    });
  }

  async getInbox(tenantId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];
    
    return this.prisma.mail.findMany({
      where: { 
        tenantId, 
        recipientEmail: user.email,
        isTrashed: false
      },
      include: { sender: { select: { name: true, email: true, profileImageUrl: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getSent(tenantId: string, senderId: string) {
    return this.prisma.mail.findMany({
      where: { 
        tenantId, 
        senderId,
        isTrashed: false
      },
      include: { recipient: { select: { name: true, email: true, profileImageUrl: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async markAsRead(tenantId: string, id: string) {
    return this.prisma.mail.update({
      where: { id, tenantId },
      data: { isRead: true }
    });
  }
}
