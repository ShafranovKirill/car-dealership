import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ProductService } from './product.service.js';
import { ReadProductDto } from './dto/read.dto.js';
import { GetProductDto } from './dto/find.dto.js';
import { FindProductsByNameDto } from './dto/find-by-name.dto.js';
import { GetProductsByBranchDto } from './dto/find-by-branch.dto.js';
import { GetProductsByCategoryDto } from './dto/find-by-category.dto.js';
import { ModelService } from './model.service.js';

@ApiTags('Model (Модели машин)')
@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}
}
