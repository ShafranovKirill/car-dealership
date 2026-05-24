import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtStaffAuthGuard } from '../../identify/index.js';
import { ConfigurationService } from './configuration.service.js';
import { CreateConfigurationRequestDto } from './dto/create.dto.js';
import { ReadConfigurationDto } from './dto/read.dto.js';
import { UpdateConfigurationRequestDto } from './dto/update.dto.js';

@ApiTags('Admin-configuration (Комплектации - админ)')
@Controller('admin/configuration')
@ApiBearerAuth('staff-auth')
@UseGuards(JwtStaffAuthGuard)
export class AdminConfigurationController {
  constructor(private readonly service: ConfigurationService) {}

  @Post('create')
  @ApiOperation({ summary: 'Создать конфигурацию' })
  async create(
    @Body() dto: CreateConfigurationRequestDto,
  ): Promise<ReadConfigurationDto> {
    return this.service.create(dto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Получить все конфигурации' })
  async findAll(): Promise<ReadConfigurationDto[]> {
    return this.service.findAll();
  }

  @Delete('delete/:configurationId')
  @ApiOperation({ summary: 'Удалить конфигурацию' })
  async delete(
    @Param('configurationId') configurationId: string,
  ): Promise<void> {
    return this.service.delete(configurationId);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Обновить конфигурацию' })
  async update(
    @Body() dto: UpdateConfigurationRequestDto,
  ): Promise<ReadConfigurationDto> {
    return this.service.update(dto);
  }
}
