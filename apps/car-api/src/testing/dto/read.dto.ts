import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DriveTestResponse } from '@car/types';
import { DriveTestStatus } from '../../../generated/prisma/enums.js';

export class BrandDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
}

export class CarModelDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  @Type(() => BrandDto)
  brand?: BrandDto;
}

export class ReadDriveTestDto implements DriveTestResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty({ example: '+79211234567' })
  @Expose()
  clientPhone!: string;

  @ApiProperty({ enum: DriveTestStatus })
  @Expose()
  status!: DriveTestStatus;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @Expose()
  carModelId!: string;

  @ApiPropertyOptional({ type: () => CarModelDto })
  @Expose()
  @Type(() => CarModelDto)
  carModel?: CarModelDto;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @Expose()
  scheduledAt?: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: string | Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt!: string | Date;
}
