import { PartialType } from '@nestjs/swagger';
import { CreateCarTechnicalInfoRequestDto } from './create-info.dto.js';

export class UpdateCarTechnicalInfoRequestDto extends PartialType(
  CreateCarTechnicalInfoRequestDto,
) {}
