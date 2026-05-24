import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ModelService } from './model.service.js';

@ApiTags('Model (Модели машин)')
@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}
}
