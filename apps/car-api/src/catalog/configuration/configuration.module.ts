import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { IdentityModule } from '../../identify/identify.module.js';
import { ConfigurationController } from './configuration.controller.js';
import { AdminConfigurationController } from './admin-configuration.controller.js';
import { ConfigurationService } from './configuration.service.js';
import { PhotoQueueModule } from '../../media/photo-queue/photo-queue.module.js';
import { MediaModule } from '../../media/media.module.js';
import { NotificationModule } from '../../notification/notification.module.js';

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    IdentityModule,
    PhotoQueueModule,
    MediaModule,
    NotificationModule,
  ],
  controllers: [ConfigurationController, AdminConfigurationController],
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
