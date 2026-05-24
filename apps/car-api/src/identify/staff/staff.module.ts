import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { StaffController } from './staff.controller.js';
import { StaffService } from './staff.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [JwtModule, ConfigModule, PrismaModule],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
