import {
  BadRequestException,
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
import { ProductService } from './product.service.js';
import { Permission } from '../../../generated/prisma/enums.js';
import { CreateProductDto } from './dto/create.dto.js';
import { UpdateProductDto } from './dto/update.dto.js';
import { AdminReadProductDto } from './dto/admin-read.dto.js';
import { JwtStaffAuthGuard } from '../../identify/index.js';
import { AclGuard } from '../../identify/acl/guards/acl.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequirePermission } from '../../identify/acl/decorators/require-permission.decorator.js';
import { CurrentStaff } from '../../shared/decorators/current-staff.decorator.js';
import { type AccessStaffTokenPayload } from '@delivest/types';

@ApiTags('Admin-model (Модели машин - админ)')
@Controller('admin/model')
@ApiBearerAuth('staff-auth')
@UseGuards(JwtStaffAuthGuard)
export class AdminModelController {
  constructor(private readonly service: ProductService) {}
}
