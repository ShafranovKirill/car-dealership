import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtStaffAuthGuard } from '../../identify/index.js';
import { ModelService } from './model.service.js';

@ApiTags('Admin-model (Модели машин - админ)')
@Controller('admin/model')
@ApiBearerAuth('staff-auth')
@UseGuards(JwtStaffAuthGuard)
export class AdminModelController {
  constructor(private readonly service: ModelService) {}
}
