import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TestingService } from './testing.service.js';
import { CreateDriveTestRequestDto } from './dto/create.dto.js';
import { ReadDriveTestDto } from './dto/read.dto.js';

@ApiTags('Test drive (Запись на тест-драйв)')
@Controller('test-drive')
export class TestingController {
  constructor(private readonly service: TestingService) {}

  @Post()
  @ApiOperation({ summary: 'Создать запись на тест-драйв' })
  async create(
    @Body() dto: CreateDriveTestRequestDto,
  ): Promise<ReadDriveTestDto> {
    return this.service.create(dto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Получить записи на тест-драйв с пагинацией' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 20 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage = 20,
  ): Promise<ReadDriveTestDto[]> {
    return this.service.findAll(page, perPage);
  }

  @Get(':testDriveId')
  @ApiOperation({ summary: 'Получить запись на тест-драйв по ID' })
  async findById(
    @Param('testDriveId') testDriveId: string,
  ): Promise<ReadDriveTestDto> {
    return this.service.findById(testDriveId);
  }
}
