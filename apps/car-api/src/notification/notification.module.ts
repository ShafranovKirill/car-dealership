import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';

import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { NotificationGateway } from './notification.gateway.js';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [],
  providers: [ConfigModule, NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
