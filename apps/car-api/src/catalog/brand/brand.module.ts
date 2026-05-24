import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { PhotoQueueModule } from '../../media/photo-queue/photo-queue.module.js';
import { MediaModule } from '../../media/media.module.js';
import { IdentityModule } from '../../identify/identify.module.js';
import { BrandController } from './brand.controller.js';
import { AdminBrandController } from './admin-brand.controller.js';
import { BrandService } from './brand.service.js';
import { NotificationModule } from '../../notification/notification.module.js';
@Module({
  imports: [
    PrismaModule,
    JwtModule,
    PhotoQueueModule,
    MediaModule,
    IdentityModule,
    NotificationModule,
  ],
  controllers: [BrandController, AdminBrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
