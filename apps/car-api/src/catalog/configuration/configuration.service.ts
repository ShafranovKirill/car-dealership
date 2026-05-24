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

@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ReadConfigurationDto[]> {
    const configurations = await this.prisma.configuration.findMany({});
    return configurations.map((configuration) =>
      toDto(configuration, ReadConfigurationDto),
    );
  }

  async create(
    dto: CreateConfigurationRequestDto,
  ): Promise<ReadConfigurationDto> {
    try {
      const configuration = await this.prisma.configuration.create({
        data: {
          ...dto,
          images: {},
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
