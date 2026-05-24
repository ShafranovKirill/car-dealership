import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

import {
  BadRequestException,
  DomainException,
  DuplicateValueException,
  NotFoundException,
} from '../../shared/exceptions/domain_exception/domain-exception.js';
import { toDto } from '../../utils/to-dto.js';
import { ReadProductDto } from './dto/read.dto.js';
import { CreateProductDto } from './dto/create.dto.js';
import { AdminReadProductDto } from './dto/admin-read.dto.js';
import {
  getInternalErrorCode,
  getPrismaModelName,
  isPrismaError,
} from '../../shared/helpers/db-errors.js';
import { PrismaErrorCode } from '@delivest/common';
import { UpdateProductDto } from './dto/update.dto.js';
import { UploadFile } from '../../media/interface/upload-file.interface.js';
import { PhotoEditorService } from '../../media/photo-queue/photo-editor.service.js';
import { DelivestEvent, PhotoMap } from '../../shared/events/types.js';
import type {
  PhotoConversionEvent,
  PhotoConversionFailedEvent,
} from '../../shared/events/types.js';
import { OnEvent } from '@nestjs/event-emitter';
import { PRODUCT_PHOTO_PRESETS } from '../../media/photo-configs/presets.js';
import { MediaService } from '../../media/media.service.js';
import { NotificationGateway } from '../../notification/notification.gateway.js';
import { type AccessStaffTokenPayload, SocketEvent } from '@delivest/types';
import { IdentityService } from '../../identify/identify.service.js';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma/dist/src/lib/transactional-adapter-prisma.js';
import { PrismaClient } from '../../../generated/prisma/client.js';
import { ReadCategoryzedProductsDto } from './dto/read-categoryzed-products.dto.js';
import { ReadCategoryDto } from '../category/dto/read.dto.js';

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly photoEditor: PhotoEditorService,
    private readonly mediaService: MediaService,
    private readonly notificationGateway: NotificationGateway,
    private readonly identityService: IdentityService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >,
  ) {}
}
