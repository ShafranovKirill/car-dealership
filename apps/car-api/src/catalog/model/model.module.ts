import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { PhotoQueueModule } from '../../media/photo-queue/photo-queue.module.js';
import { MediaModule } from '../../media/media.module.js';
import { IdentityModule } from '../../identify/identify.module.js';
import { ModelService } from './model.service.js';
import { ModelController } from './model.controller.js';
import { AdminModelController } from './admin-model.controller.js';
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
  controllers: [ModelController, AdminModelController],
  providers: [ModelService],
  exports: [ModelService],
})
export class ModelModule {}
