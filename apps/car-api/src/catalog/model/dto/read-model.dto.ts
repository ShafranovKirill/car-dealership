import { CarModelResponse } from '@car/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BodyType, CarClass } from '../../../../generated/prisma/enums.js';
import { PhotoKey } from '@car/common';

export class CarModelResponseDto implements CarModelResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  generation!: string;

  @ApiProperty()
  @Expose()
  yearFrom!: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @Expose()
  yearTo!: number | null;

  @ApiProperty({ enum: BodyType })
  @Expose()
  bodyType!: BodyType;

  @ApiProperty({ enum: CarClass })
  @Expose()
  carClass!: CarClass;

  @ApiProperty({
    description: 'Объект фото модели',
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @Expose()
  images!: Record<PhotoKey, string>;

  @ApiProperty()
  @Expose()
  minPrice!: number;

  @ApiProperty()
  @Expose()
  brandId!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: string | Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt!: string | Date;
}
