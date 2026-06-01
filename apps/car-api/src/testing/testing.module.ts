import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { IdentityModule } from '../identify/identify.module.js';
import { TestingController } from './testing.controller.js';
import { AdminTestingController } from './admin-testing.controller.js';
import { TestingService } from './testing.service.js';

@Module({
  imports: [PrismaModule, JwtModule, IdentityModule],
  controllers: [TestingController, AdminTestingController],
  providers: [TestingService],
  exports: [TestingService],
})
export class TestingModule {}
