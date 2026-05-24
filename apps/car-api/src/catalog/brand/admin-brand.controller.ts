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
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtStaffAuthGuard } from '../../identify/index.js';
import { BrandService } from './brand.service.js';
import { CreateBrandDto } from './dto/create.dto.js';
import { ReadBrandDto } from './dto/read.dto.js';
import { UpdateBrandDto } from './dto/update.dto.js';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/index.js';
import { BadRequestException } from '../../shared/exceptions/domain_exception/domain-exception.js';

@ApiTags('Admin-model (Производители машин - админ)')
@Controller('admin/model')
@ApiBearerAuth('staff-auth')
@UseGuards(JwtStaffAuthGuard)
export class AdminBrandController {
  constructor(private readonly service: BrandService) {}
  @Post('create')
  @ApiOperation({ summary: 'Создать производителя' })
  async create(@Body() dto: CreateBrandDto): Promise<ReadBrandDto> {
    const product = await this.service.create(dto);

    return product;
  }

  @Get('all')
  @ApiOperation({ summary: 'Получить всех производителей' })
  async findAll(): Promise<ReadBrandDto[]> {
    return this.service.findAll();
  }

  @Delete('delete/:brandId')
  @ApiOperation({ summary: 'Удалить производителя' })
  async delete(@Param('brandId') brandId: string): Promise<void> {
    return this.service.delete(brandId);
  }

  @Patch('update')
  @ApiOperation({ summary: 'Обновить производителя' })
  async update(@Body() dto: UpdateBrandDto): Promise<ReadBrandDto> {
    return this.service.update(dto);
  }

  @Post(':id/photo')
  @ApiOperation({
    summary: 'Загрузить или обновить фото продукта',
    description:
      'Загружает фото продукта и ставит его на обработку (resize + конвертация)',
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
    @Param('id') productId: string,
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
      productId,
      socketId,
    );
  }
}
