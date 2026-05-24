import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtStaffAuthGuard } from '../../identify/index.js';
import { ModelService } from './model.service.js';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/index.js';
import { BadRequestException } from '../../shared/exceptions/domain_exception/domain-exception.js';
import { CreateCarModelRequestDto } from './dto/create.dto.js';
import { CarModelResponseDto } from './dto/read-model.dto.js';
import { UpdateCarModelRequestDto } from './dto/update.dto.js';
import { CarModelFullResponseDto } from './dto/read-full.dto.js';

@ApiTags('Admin-model (Модели машин - админ)')
@Controller('admin/model')
@ApiBearerAuth('staff-auth')
@UseGuards(JwtStaffAuthGuard)
export class AdminModelController {
  constructor(private readonly service: ModelService) {}

  @Post('create')
  @ApiOperation({ summary: 'Создать модель машины' })
  async create(
    @Body() dto: CreateCarModelRequestDto,
  ): Promise<CarModelResponseDto> {
    return this.service.create(dto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Получить все модели' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'perPage', required: false, example: 20 })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage = 20,
  ): Promise<CarModelResponseDto[]> {
    return this.service.findAll(page, perPage);
  }

  @Get(':modelId')
  @ApiOperation({ summary: 'Получить модель по ID' })
  async findById(
    @Param('modelId') modelId: string,
  ): Promise<CarModelFullResponseDto> {
    return this.service.findById(modelId);
  }

  @Delete('delete/:modelId')
  @ApiOperation({ summary: 'Удалить модель' })
  async delete(@Param('modelId') modelId: string): Promise<void> {
    return this.service.delete(modelId);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Обновить модель' })
  async update(
    @Body() dto: UpdateCarModelRequestDto,
  ): Promise<CarModelResponseDto> {
    return this.service.update(dto);
  }

  @Post(':id/photo')
  @ApiOperation({
    summary: 'Загрузить или обновить фото модели',
    description:
      'Загружает фото модели и ставит его на обработку (resize + конвертация)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('id') modelId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('socketId') socketId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    return this.service.updatePhoto(
      {
        body: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      modelId,
      socketId,
    );
  }
}
