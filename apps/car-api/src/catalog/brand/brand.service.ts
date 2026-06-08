import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

import {
  BadRequestException,
  DomainException,
  DuplicateValueException,
  NotFoundException,
} from '../../shared/exceptions/domain_exception/domain-exception.js';
import { toDto } from '../../utils/to-dto.js';
import {
  getInternalErrorCode,
  getPrismaModelName,
  isPrismaError,
} from '../../shared/helpers/db-errors.js';
import { UpdateBrandDto } from './dto/update.dto.js';
import { UploadFile } from '../../media/interface/upload-file.interface.js';
import { PhotoEditorService } from '../../media/photo-queue/photo-editor.service.js';
import { ProjectEvent, PhotoMap } from '../../shared/events/types.js';
import type {
  PhotoConversionEvent,
  PhotoConversionFailedEvent,
} from '../../shared/events/types.js';
import { OnEvent } from '@nestjs/event-emitter';
import { BRAND_PHOTO_PRESETS } from '../../media/photo-configs/presets.js';
import { MediaService } from '../../media/media.service.js';
import { ReadBrandDto } from './dto/read.dto.js';
import { CreateBrandDto } from './dto/create.dto.js';
import { NotificationGateway } from '../../notification/notification.gateway.js';
import { SocketEvent } from '@car/types';
import { PrismaErrorCode } from '@car/common';

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly photoEditor: PhotoEditorService,
    private readonly mediaService: MediaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  async findAll() {
    const brands = await this.prisma.brand.findMany({});
    return brands.map((brand) => toDto(brand, ReadBrandDto));
  }

  async create(dto: CreateBrandDto): Promise<ReadBrandDto> {
    try {
      const brand = await this.prisma.brand.create({
        data: {
          ...dto,
        },
      });
      return toDto(brand, ReadBrandDto);
    } catch (error) {
      this.handleBrandConstraintError(error);
    }
  }

  async update(dto: UpdateBrandDto): Promise<ReadBrandDto> {
    try {
      const brand = await this.prisma.brand.update({
        where: { id: dto.brandId },
        data: {
          name: dto.name,
        },
      });
      return toDto(brand, ReadBrandDto);
    } catch (error) {
      this.handleBrandConstraintError(error);
    }
  }

  async delete(brandId: string): Promise<void> {
    try {
      await this.prisma.brand.delete({
        where: { id: brandId },
      });
    } catch (error) {
      this.handleBrandConstraintError(error);
    }
  }

  async updatePhoto(
    file: UploadFile,
    brandId: string,
    socketId: string,
  ): Promise<void> {
    try {
      const brand = await this.prisma.brand.findUnique({
        where: { id: brandId },
      });

      if (!brand)
        throw new NotFoundException(`Brand with ID ${brandId} not found`);

      await this.photoEditor.uploadAndEditMultiple(
        brandId,
        file,
        BRAND_PHOTO_PRESETS,
        socketId,
        ProjectEvent.BRAND_PHOTO_CONVERTED,
        ProjectEvent.BRAND_PHOTO_CONVERSION_FAILED,
      );

      this.logger.log(
        `updatePhoto() initialized | brand: ${brandId} | job sent to queue`,
      );
    } catch (error) {
      this.logger.error(
        `updatePhoto() failed | brandId: ${brandId} | error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  @OnEvent(ProjectEvent.BRAND_PHOTO_CONVERTED)
  async handleBrandPhotoBatch(payload: PhotoConversionEvent) {
    const { targetId, socketId, photos } = payload;

    try {
      const existingBrand = await this.prisma.brand.findUnique({
        where: { id: targetId },
        select: { images: true },
      });

      await this.prisma.brand.update({
        where: { id: targetId },
        data: { images: photos },
      });

      if (existingBrand?.images) {
        const oldPhotos = existingBrand.images as PhotoMap;
        const newKeys = new Set(Object.values(photos));
        const keysToDelete = Object.values(oldPhotos).filter(
          (oldKey) => oldKey && !newKeys.has(oldKey),
        );

        if (keysToDelete.length > 0) {
          await this.mediaService.deleteFilesByKeys(keysToDelete);
          this.logger.log(
            `handleBrandPhotoBatch() | Cleanup | Deleted ${keysToDelete.length} old photos for brand ${targetId}`,
          );
        }
      }

      this.logger.log(
        `handleBrandPhotoBatch() success | Brand photos updated | id: ${targetId}`,
      );

      this.notificationGateway.server
        .to(socketId)
        .emit(SocketEvent.PHOTO_EDIT_RESULT, {
          success: true,
          targetId,
          photos,
        });
    } catch (error) {
      this.logger.error(
        `handleBrandPhotoBatch() failed | brand: ${targetId} | error: ${(error as Error).message}`,
      );
    }
  }

  @OnEvent(ProjectEvent.BRAND_PHOTO_CONVERSION_FAILED)
  handlePhotoConversionFailedEvent(event: PhotoConversionFailedEvent) {
    const { fileId, error } = event;

    this.logger.error(
      `Photo conversion failed | file: ${fileId} | error: ${error}`,
    );
  }

  handleBrandConstraintError(error: unknown): never {
    if (error instanceof DomainException) throw error;

    if (!isPrismaError(error)) {
      this.logger.error(`Unexpected system error: ${(error as Error).stack}`);
      throw error;
    }

    const internalCode = getInternalErrorCode(error);
    const modelName = getPrismaModelName(error);

    if (internalCode === PrismaErrorCode.RECORD_NOT_FOUND) {
      throw new NotFoundException(`${modelName || 'Record'} not found`);
    }

    if (internalCode === PrismaErrorCode.UNIQUE_VIOLATION) {
      if (modelName === 'Brand') {
        throw new BadRequestException('Brand with this name already exists');
      }
      throw new DuplicateValueException();
    }

    throw new BadRequestException('Database operation failed');
  }
}
