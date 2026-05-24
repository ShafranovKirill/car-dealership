import { CreateCarTechnicalInfoRequest } from '@car/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import {
  DriveType,
  EngineType,
  TransmissionType,
} from '../../../../generated/prisma/enums.js';

export class CreateCarTechnicalInfoRequestDto implements CreateCarTechnicalInfoRequest {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  carModelId!: string;

  @ApiProperty({ example: 4935 })
  @IsNumber()
  @Min(0)
  length!: number;

  @ApiProperty({ example: 1868 })
  @IsNumber()
  @Min(0)
  width!: number;

  @ApiProperty({ example: 1466 })
  @IsNumber()
  @Min(0)
  height!: number;

  @ApiProperty({ example: 2975 })
  @IsNumber()
  @Min(0)
  wheelbase!: number;

  @ApiProperty({ example: 140 })
  @IsNumber()
  @Min(0)
  clearance!: number;

  @ApiProperty({ example: 530 })
  @IsNumber()
  @Min(0)
  trunkVolume!: number;

  @ApiPropertyOptional({ example: 1700 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  trunkMaxVolume?: number;

  @ApiProperty({ enum: EngineType, example: EngineType.BENZIN })
  @IsEnum(EngineType)
  engineType!: EngineType;

  @ApiProperty({ example: 2.0 })
  @IsNumber()
  @Min(0)
  engineVolume!: number;

  @ApiProperty({ example: 249 })
  @IsNumber()
  @Min(0)
  enginePower!: number;

  @ApiProperty({ example: 350 })
  @IsNumber()
  @Min(0)
  engineTorque!: number;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cylindersCount?: number;

  @ApiProperty({ enum: TransmissionType, example: TransmissionType.AUTOMATIC })
  @IsEnum(TransmissionType)
  transmission!: TransmissionType;

  @ApiProperty({ enum: DriveType, example: DriveType.AWD })
  @IsEnum(DriveType)
  driveType!: DriveType;
}
