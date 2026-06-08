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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtStaffAuthGuard } from '../../identify/index.js';
import { ConfigurationService } from './configuration.service.js';
import { CreateConfigurationRequestDto } from './dto/create.dto.js';
import { ReadConfigurationDto } from './dto/read.dto.js';
import { UpdateConfigurationRequestDto } from './dto/update.dto.js';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/index.js';
import { BadRequestException } from '../../shared/exceptions/domain_exception/domain-exception.js';

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

  @Get('model/:modelId')
  @ApiOperation({ summary: 'Получить все конфигурации по модели' })
  async findAllByModel(
    @Param('modelId') modelId: string,
  ): Promise<ReadConfigurationDto[]> {
    return this.service.findAllByModel(modelId);
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

  @Post(':id/photo')
  @ApiOperation({
    summary: 'Загрузить или обновить фото конфигурации',
    description:
      'Загружает фото конфигурации и ставит его на обработку (resize + конвертация)',
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
    @Param('id') configurationId: string,
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
      configurationId,
      socketId,
    );
  }

  @Delete(':configurationId/photo')
  @ApiOperation({
    summary: 'Удалить фотографию из галереи по её S3 ключу',
    description:
      'Ищет переданный ключ в массиве, определяет его индекс и удаляет этот индекс из всех размеров',
  })
  @ApiQuery({
    name: 'fileKey',
    description: 'Полный S3 ключ файла (например, cd7b7b17.../9e13e5ed...)',
    required: true,
  })
  async deletePhotoByKey(
    @Param('configurationId') configurationId: string,
    @Query('fileKey') fileKey: string,
  ): Promise<void> {
    if (!fileKey) {
      throw new BadRequestException('Параметр fileKey обязателен');
    }
    return this.service.deletePhotoByKey(configurationId, fileKey);
  }
}
