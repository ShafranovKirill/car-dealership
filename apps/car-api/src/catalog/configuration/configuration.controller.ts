import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service.js';
import { ReadConfigurationDto } from './dto/read.dto.js';

@ApiTags('Configuration (Комплектации)')
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly service: ConfigurationService) {}

  @Get('/model/:modelId')
  @ApiOperation({ summary: 'Получить все конфигурации' })
  async findAllByModel(
    @Param('modelId') modelId: string,
  ): Promise<ReadConfigurationDto[]> {
    return this.service.findAllByModel(modelId);
  }
}
