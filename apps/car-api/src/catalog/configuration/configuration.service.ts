import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateConfigurationRequestDto } from './dto/create.dto.js';
import { UpdateConfigurationRequestDto } from './dto/update.dto.js';
import { ReadConfigurationDto } from './dto/read.dto.js';
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
import { CONFIGURATION_PHOTO_PRESETS } from '../../media/photo-configs/presets.js';

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly photoEditor: PhotoEditorService,
    private readonly mediaService: MediaService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async findAllByModel(modelId: string): Promise<ReadConfigurationDto[]> {
    const configurations = await this.prisma.configuration.findMany({
      where: { carModelId: modelId },
    });
    return configurations.map((configuration) =>
      toDto(configuration, ReadConfigurationDto),
    );
  }

  async updatePhoto(
    file: UploadFile,
    configurationId: string,
    socketId: string,
  ): Promise<void> {
    try {
      const configuration = await this.prisma.configuration.findUnique({
        where: { id: configurationId },
      });

      if (!configuration)
        throw new NotFoundException(
          `Configuration with ID ${configurationId} not found`,
        );

      await this.photoEditor.uploadAndEditMultiple(
        configurationId,
        file,
        CONFIGURATION_PHOTO_PRESETS,
        socketId,
        ProjectEvent.CONFIGURATION_PHOTO_CONVERTED,
        ProjectEvent.CONFIGURATION_PHOTO_CONVERSION_FAILED,
      );

      this.logger.log(
        `updatePhoto() initialized | configuration: ${configurationId} | job sent to queue`,
      );
    } catch (error) {
      this.logger.error(
        `updatePhoto() failed | configurationId: ${configurationId} | error: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  @OnEvent(ProjectEvent.CONFIGURATION_PHOTO_CONVERTED)
  async handleConfigurationPhotoBatch(payload: PhotoConversionEvent) {
    const { targetId, socketId, photos } = payload;

    try {
      const existingConfiguration = await this.prisma.configuration.findUnique({
        where: { id: targetId },
        select: { images: true },
      });

      const currentImages =
        (existingConfiguration?.images as Record<string, string[]>) || {};

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

      await this.prisma.configuration.update({
        where: { id: targetId },
        data: { images: updatedImages },
      });

      this.logger.log(
        `handleConfigurationPhotoBatch() success | Added photo to size-arrays for configuration ${targetId}`,
      );

      this.notificationGateway.server
        .to(socketId)
        .emit(SocketEvent.PHOTO_EDIT_RESULT, {
          success: true,
          configurationId: targetId,
          images: updatedImages,
        });
    } catch (error) {
      this.logger.error(
        `handleConfigurationPhotoBatch() failed | configuration: ${targetId} | error: ${(error as Error).message}`,
      );
    }
  }

  @OnEvent(ProjectEvent.CONFIGURATION_PHOTO_CONVERSION_FAILED)
  handleConfigurationPhotoConversionFailed(
    event: PhotoConversionFailedEvent,
  ): void {
    const { fileId, error } = event;
    this.logger.error(
      `Configuration photo conversion failed | file: ${fileId} | error: ${error}`,
    );
  }

  async create(
    dto: CreateConfigurationRequestDto,
  ): Promise<ReadConfigurationDto> {
    try {
      const configuration = await this.prisma.configuration.create({
        data: {
          ...dto,
        },
      });
      return toDto(configuration, ReadConfigurationDto);
    } catch (error) {
      this.handleConfigurationConstraintError(error);
    }
  }

  async update(
    dto: UpdateConfigurationRequestDto,
  ): Promise<ReadConfigurationDto> {
    try {
      const updateData: {
        name?: string;
        price?: number;
        description?: string;
      } = {};

      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.price !== undefined) updateData.price = dto.price;
      if (dto.description !== undefined)
        updateData.description = dto.description;

      const configuration = await this.prisma.configuration.update({
        where: { id: dto.configurationId },
        data: updateData,
      });
      return toDto(configuration, ReadConfigurationDto);
    } catch (error) {
      this.handleConfigurationConstraintError(error);
    }
  }

  async deletePhotoByKey(
    configurationId: string,
    fileKey: string,
  ): Promise<void> {
    const configuration = await this.prisma.configuration.findUnique({
      where: { id: configurationId },
      select: { images: true },
    });

    if (!configuration) {
      throw new NotFoundException(
        `Конфигурация с ID ${configurationId} не найдена`,
      );
    }

    if (!configuration.images) {
      throw new BadRequestException(
        'У данной конфигурации нет загруженных фотографий',
      );
    }

    const images = configuration.images as Record<string, string[]>;
    let targetIndex = -1;

    for (const filesArray of Object.values(images)) {
      if (Array.isArray(filesArray)) {
        targetIndex = filesArray.indexOf(fileKey);
        if (targetIndex !== -1) break;
      }
    }

    if (targetIndex === -1) {
      throw new NotFoundException(
        `Указанный файл не найден в галерее этой конфигурации`,
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
          `Ошибка S3 при удалении файлов для конфигурации ${configurationId} по ключу ${fileKey}: ${(s3Error as Error).message}`,
        );
      }
    }

    await this.prisma.configuration.update({
      where: { id: configurationId },
      data: { images: updatedImages },
    });

    this.logger.log(
      `deletePhotoByKey() success | Фотка удалена по ключу. Индекс в массивах: ${targetIndex}. Конфигурация: ${configurationId}`,
    );
  }

  async delete(configurationId: string): Promise<void> {
    try {
      await this.prisma.configuration.delete({
        where: { id: configurationId },
      });
    } catch (error) {
      this.handleConfigurationConstraintError(error);
    }
  }

  handleConfigurationConstraintError(error: unknown): never {
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
      if (modelName === 'Configuration') {
        throw new BadRequestException(
          'Configuration for this car model already exists',
        );
      }
      throw new DuplicateValueException();
    }

    throw new BadRequestException('Database operation failed');
  }
}
