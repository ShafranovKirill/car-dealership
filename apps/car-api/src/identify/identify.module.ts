import { Module } from '@nestjs/common';
import { IdentityService } from './identify.service.js';
import { StaffModule } from './staff/staff.module.js';

@Module({
  imports: [StaffModule],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
