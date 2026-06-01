import {
  Body,
  Controller,
  Delete,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TestingService } from './testing.service.js';
import { UpdateDriveTestRequestDto } from './dto/update.dto.js';
import { ReadDriveTestDto } from './dto/read.dto.js';
import { JwtStaffAuthGuard } from '../identify/index.js';

@ApiTags('Admin test drive (Запись на тест-драйв - админ)')
@Controller('admin/test-drive')
@ApiBearerAuth('staff-auth')
@UseGuards(JwtStaffAuthGuard)
export class AdminTestingController {
  constructor(private readonly service: TestingService) {}

  @Get('all')
  @ApiOperation({
    summary: 'Получить записи на тест-драйв с пагинацией (админ)',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 20 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage = 20,
  ): Promise<ReadDriveTestDto[]> {
    return this.service.findAll(page, perPage);
  }

  @Get(':testDriveId')
  @ApiOperation({ summary: 'Получить запись на тест-драйв по ID (админ)' })
  async findById(
    @Param('testDriveId') testDriveId: string,
  ): Promise<ReadDriveTestDto> {
    return this.service.findById(testDriveId);
  }

  @Patch()
  @ApiOperation({ summary: 'Обновить запись на тест-драйв (админ)' })
  async update(
    @Body() dto: UpdateDriveTestRequestDto,
  ): Promise<ReadDriveTestDto> {
    return this.service.update(dto);
  }

  @Delete(':testDriveId')
  @ApiOperation({ summary: 'Удалить запись на тест-драйв (админ)' })
  async delete(@Param('testDriveId') testDriveId: string): Promise<void> {
    return this.service.delete(testDriveId);
  }
}
