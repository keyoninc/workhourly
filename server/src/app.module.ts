import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { PrismaModule } from './prisma/prisma.module';
import { MinioModule } from './minio/minio.module';
import { DepartmentsModule } from './departments/departments.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    PrismaModule, 
    MinioModule, 
    AuthModule, 
    UsersModule,
    TenantsModule,
    DepartmentsModule,
    MailModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
