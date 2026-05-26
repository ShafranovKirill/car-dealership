import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCarModelRequestDto } from './dto/create.dto.js';
import { UpdateCarModelRequestDto } from './dto/update.dto.js';
import { CarModelResponseDto } from './dto/read-model.dto.js';
import { toDto } from '../../utils/to-dto.js';
import {
  BadRequestException,
  DomainException,
  DuplicateValueException,
  NotFoundException,
} from '../../shared/exceptions/domain_exception/domain-exception.js';
import {
  getInternalErrorCode,
  getPrismaModelName,
  isPrismaError,
} from '../../shared/helpers/db-errors.js';
import { PrismaErrorCode } from '@car/common';
import { PhotoEditorService } from '../../media/photo-queue/photo-editor.service.js';
import { MediaService } from '../../media/media.service.js';
import { NotificationGateway } from '../../notification/notification.gateway.js';
import { SocketEvent } from '@car/types';
import { UploadFile } from '../../media/interface/upload-file.interface.js';
import type {
  PhotoConversionEvent,
  PhotoConversionFailedEvent,
} from '../../shared/events/types.js';
import { ProjectEvent } from '../../shared/events/types.js';
import { OnEvent } from '@nestjs/event-emitter';
import { MODEL_PHOTO_PRESETS } from '../../media/photo-configs/presets.js';

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly photoEditor: PhotoEditorService,
    private readonly mediaService: MediaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async findAll(page = 1, perPage = 20): Promise<CarModelResponseDto[]> {
    const take = Math.max(1, Number(perPage) || 20);
    const skip = Math.max(0, (Number(page) - 1) * take);

    const carModels = await this.prisma.carModel.findMany({
      skip,
      take,
    });

    return carModels.map((carModel) => toDto(carModel, CarModelResponseDto));
  }

  async findById(modelId: string): Promise<CarModelResponseDto> {
    const carModel = await this.prisma.carModel.findUnique({
      where: { id: modelId },
      include: {
        configurations: true,
      },
    });

    if (!carModel) {
      throw new NotFoundException(`Car model with ID ${modelId} not found`);
    }

    return toDto(carModel, CarModelResponseDto);
  }

  async create(dto: CreateCarModelRequestDto): Promise<CarModelResponseDto> {
    try {
      const carModel = await this.prisma.carModel.create({
        data: {
          ...dto,
        },
      });

      return toDto(carModel, CarModelResponseDto);
    } catch (error) {
      this.handleModelConstraintError(error);
    }
  }

  async update(dto: UpdateCarModelRequestDto): Promise<CarModelResponseDto> {
    try {
      const { modelId, ...carModelData } = dto;

      const carModel = await this.prisma.carModel.update({
        where: { id: modelId },
        data: {
          ...carModelData,
        },
      });

      return toDto(carModel, CarModelResponseDto);
    } catch (error) {
      this.handleModelConstraintError(error);
    }
  }

  async delete(modelId: string): Promise<void> {
    try {
      await this.prisma.carModel.delete({
        where: { id: modelId },
      });
    } catch (error) {
      this.handleModelConstraintError(error);
    }
  }
  async deletePhotoByKey(modelId: string, fileKey: string): Promise<void> {
    const carModel = await this.prisma.carModel.findUnique({
      where: { id: modelId },
      select: { images: true },
    });

    if (!carModel) {
      throw new NotFoundException(
        `Модель автомобиля с ID ${modelId} не найдена`,
      );
    }

    if (!carModel.images) {
      throw new BadRequestException(
        'У данной модели нет загруженных фотографий',
      );
    }

    const images = carModel.images as Record<string, string[]>;

    let targetIndex = -1;

    for (const filesArray of Object.values(images)) {
      if (Array.isArray(filesArray)) {
        targetIndex = filesArray.indexOf(fileKey);
        if (targetIndex !== -1) break;
      }
    }

    if (targetIndex === -1) {
      throw new NotFoundException(
        `Указанный файл не найден в галерее этой модели`,
      );
    }

    const keysToDeleteFromS3: string[] = [];
    const updatedImages: Record<string, string[]> = {};

    for (const [sizeKey, filesArray] of Object.entries(images)) {
      if (!Array.isArray(filesArray)) {
        updatedImages[sizeKey] = filesArray;
        continue;
      }

      const keyToDelete = filesArray[targetIndex];
      if (keyToDelete) {
        keysToDeleteFromS3.push(keyToDelete);
      }

      updatedImages[sizeKey] = filesArray.filter((_, i) => i !== targetIndex);
    }

    if (keysToDeleteFromS3.length > 0) {
      try {
        await this.mediaService.deleteFilesByKeys(keysToDeleteFromS3);
      } catch (s3Error) {
        this.logger.error(
          `Ошибка S3 при удалении файлов для модели ${modelId} по ключу ${fileKey}: ${(s3Error as Error).message}`,
        );
      }
    }

    await this.prisma.carModel.update({
      where: { id: modelId },
      data: { images: updatedImages },
    });

    this.logger.log(
      `deletePhotoByKey() success | Фотка удалена по ключу. Индекс в массивах: ${targetIndex}. Модель: ${modelId}`,
    );
  }
  async updatePhoto(
    file: UploadFile,
    modelId: string,
    socketId: string,
  ): Promise<void> {
    try {
      const carModel = await this.prisma.carModel.findUnique({
        where: { id: modelId },
      });

      if (!carModel)
        throw new NotFoundException(`Car model with ID ${modelId} not found`);

      await this.photoEditor.uploadAndEditMultiple(
        modelId,
        file,
        MODEL_PHOTO_PRESETS,
        socketId,
        ProjectEvent.MODEL_PHOTO_CONVERTED,
        ProjectEvent.MODEL_PHOTO_CONVERSION_FAILED,
      );

      this.logger.log(
        `updatePhoto() initialized | model: ${modelId} | job sent to queue`,
      );
    } catch (error) {
      this.logger.error(
        `updatePhoto() failed | modelId: ${modelId} | error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  @OnEvent(ProjectEvent.MODEL_PHOTO_CONVERTED)
  async handleModelPhotoBatch(payload: PhotoConversionEvent) {
    const { targetId, socketId, photos } = payload;

    try {
      const existingModel = await this.prisma.carModel.findUnique({
        where: { id: targetId },
        select: { images: true },
      });

      const currentImages =
        (existingModel?.images as Record<string, string[]>) || {};

      const updatedImages: Record<string, string[]> = {};

      for (const [sizeKey, newFilePath] of Object.entries(photos)) {
        const sizeArray = currentImages[sizeKey] || [];

        updatedImages[sizeKey] = [...sizeArray, newFilePath];
      }

      for (const [key, value] of Object.entries(currentImages)) {
        if (!updatedImages[key]) {
          updatedImages[key] = value;
        }
      }

      await this.prisma.carModel.update({
        where: { id: targetId },
        data: { images: updatedImages },
      });

      this.logger.log(
        `handleModelPhotoBatch() success | Added photo to size-arrays for model ${targetId}`,
      );

      this.notificationGateway.server
        .to(socketId)
        .emit(SocketEvent.PHOTO_EDIT_RESULT, {
          success: true,
          modelId: targetId,
          images: updatedImages,
        });
    } catch (error) {
      this.logger.error(
        `handleModelPhotoBatch() failed | model: ${targetId} | error: ${(error as Error).message}`,
      );
    }
  }
  @OnEvent(ProjectEvent.MODEL_PHOTO_CONVERSION_FAILED)
  handlePhotoConversionFailedEvent(event: PhotoConversionFailedEvent): void {
    const { fileId, error } = event;

    this.logger.error(
      `Photo conversion failed | file: ${fileId} | error: ${error}`,
    );
  }

  handleModelConstraintError(error: unknown): never {
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
      if (modelName === 'CarModel') {
        throw new BadRequestException(
          'Car model with this name already exists',
        );
      }
      throw new DuplicateValueException();
    }

    throw new BadRequestException('Database operation failed');
  }
}
