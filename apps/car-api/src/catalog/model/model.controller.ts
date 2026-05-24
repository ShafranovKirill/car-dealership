import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ModelService } from './model.service.js';
import { CarModelResponseDto } from './dto/read-model.dto.js';
import { CarModelFullResponseDto } from './dto/read-full.dto.js';

@ApiTags('Model (Модели машин)')
@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get('all')
  @ApiOperation({ summary: 'Получить все модели' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 20 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage = 20,
  ): Promise<CarModelResponseDto[]> {
    return this.modelService.findAll(page, perPage);
  }

  @Get(':modelId')
  @ApiOperation({ summary: 'Получить модель по ID' })
  async findById(
    @Param('modelId') modelId: string,
  ): Promise<CarModelFullResponseDto> {
    return this.modelService.findById(modelId);
  }
}
