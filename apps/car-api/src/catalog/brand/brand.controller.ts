import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandService } from './brand.service.js';
import { ReadBrandDto } from './dto/read.dto.js';

@ApiTags('Brand (Марки машин)')
@Controller('brand')
export class BrandController {
  constructor(private readonly service: BrandService) {}
  @Get('all')
  @ApiOperation({ summary: 'Получить всех производителей' })
  async findAll(): Promise<ReadBrandDto[]> {
    return this.service.findAll();
  }
}
