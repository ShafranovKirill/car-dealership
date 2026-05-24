import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  DriveType,
  EngineType,
  TransmissionType,
} from '../../../../generated/prisma/enums.js';
import { CarTechnicalInfoResponse } from '@car/types';

export class CarTechnicalInfoResponseDto implements CarTechnicalInfoResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  length!: number;

  @ApiProperty()
  @Expose()
  width!: number;

  @ApiProperty()
  @Expose()
  height!: number;

  @ApiProperty()
  @Expose()
  wheelbase!: number;

  @ApiProperty()
  @Expose()
  clearance!: number;

  @ApiProperty()
  @Expose()
  trunkVolume!: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @Expose()
  trunkMaxVolume!: number | null;

  @ApiProperty({ enum: EngineType })
  @Expose()
  engineType!: EngineType;

  @ApiProperty()
  @Expose()
  engineVolume!: number;

  @ApiProperty()
  @Expose()
  enginePower!: number;

  @ApiProperty()
  @Expose()
  engineTorque!: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @Expose()
  cylindersCount!: number | null;

  @ApiProperty({ enum: TransmissionType })
  @Expose()
  transmission!: TransmissionType;

  @ApiProperty({ enum: DriveType })
  @Expose()
  driveType!: DriveType;

  @ApiProperty()
  @Expose()
  engineId!: string;

  @ApiProperty()
  @Expose()
  carModelId!: string;
}
