import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigurationService } from './configuration.service.js';
import { ReadConfigurationDto } from './dto/read.dto.js';

@ApiTags('Configuration (Комплектации)')
@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly service: ConfigurationService) {}

  @Get('all')
  @ApiOperation({ summary: 'Получить все конфигурации' })
  async findAll(): Promise<ReadConfigurationDto[]> {
    return this.service.findAll();
  }
}
