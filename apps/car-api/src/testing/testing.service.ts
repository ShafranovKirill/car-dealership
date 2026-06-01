import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { toDto } from '../utils/to-dto.js';
import { CreateDriveTestRequestDto } from './dto/create.dto.js';
import { UpdateDriveTestRequestDto } from './dto/update.dto.js';
import { ReadDriveTestDto } from './dto/read.dto.js';
import {
  BadRequestException,
  DomainException,
  DuplicateValueException,
  NotFoundException,
} from '../shared/exceptions/domain_exception/domain-exception.js';
import {
  getInternalErrorCode,
  getPrismaModelName,
  isPrismaError,
} from '../shared/helpers/db-errors.js';
import { PrismaErrorCode } from '@car/common';

@Injectable()
export class TestingService {
  private readonly logger = new Logger(TestingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, perPage = 20): Promise<ReadDriveTestDto[]> {
    const take = Math.max(1, Number(perPage) || 20);
    const skip = Math.max(0, (Number(page) - 1) * take);

    const driveTests = await this.prisma.driveTest.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return driveTests.map((item) => toDto(item, ReadDriveTestDto));
  }

  async findById(testDriveId: string): Promise<ReadDriveTestDto> {
    const driveTest = await this.prisma.driveTest.findUnique({
      where: { id: testDriveId },
    });

    if (!driveTest) {
      throw new NotFoundException(
        `Drive test with ID ${testDriveId} not found`,
      );
    }

    return toDto(driveTest, ReadDriveTestDto);
  }

  async create(dto: CreateDriveTestRequestDto): Promise<ReadDriveTestDto> {
    try {
      const driveTest = await this.prisma.driveTest.create({
        data: {
          ...dto,
        },
      });

      return toDto(driveTest, ReadDriveTestDto);
    } catch (error) {
      this.handleTestingConstraintError(error);
    }
  }

  async update(dto: UpdateDriveTestRequestDto): Promise<ReadDriveTestDto> {
    try {
      const { driveTestId, ...updateData } = dto;

      const driveTest = await this.prisma.driveTest.update({
        where: { id: driveTestId },
        data: {
          ...updateData,
        },
      });

      return toDto(driveTest, ReadDriveTestDto);
    } catch (error) {
      this.handleTestingConstraintError(error);
    }
  }

  async delete(testDriveId: string): Promise<void> {
    try {
      await this.prisma.driveTest.delete({
        where: { id: testDriveId },
      });
    } catch (error) {
      this.handleTestingConstraintError(error);
    }
  }

  handleTestingConstraintError(error: unknown): never {
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
      if (modelName === 'DriveTest') {
        throw new BadRequestException(
          'Drive test for this car model already exists',
        );
      }
      throw new DuplicateValueException();
    }

    throw new BadRequestException('Database operation failed');
  }
}
