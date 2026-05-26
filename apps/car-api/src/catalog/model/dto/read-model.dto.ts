import { CarModelResponse } from '@car/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  BodyType,
  CarClass,
  DriveType,
  EngineType,
  TransmissionType,
} from '../../../../generated/prisma/enums.js';
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

  @ApiProperty({ description: 'Длина (в мм)' })
  @Expose()
  length!: number;

  @ApiProperty({ description: 'Ширина (в мм)' })
  @Expose()
  width!: number;

  @ApiProperty({ description: 'Высота (в мм)' })
  @Expose()
  height!: number;

  @ApiProperty({ description: 'Колесная база (в мм)' })
  @Expose()
  wheelbase!: number;

  @ApiProperty({ description: 'Дорожный просвет / клиренс (в мм)' })
  @Expose()
  clearance!: number;

  @ApiProperty({ description: 'Объем багажника (в литрах)' })
  @Expose()
  trunkVolume!: number;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'Максимальный объем багажника (при сложенных сиденьях)',
  })
  @Expose()
  trunkMaxVolume!: number | null;

  @ApiProperty({
    enum: EngineType,
    description: 'Тип двигателя (бензин, дизель, гибрид, электро)',
  })
  @Expose()
  engineType!: EngineType;

  @ApiProperty({ type: Number, description: 'Объем двигателя (в литрах)' })
  @Expose()
  engineVolume!: number;

  @ApiProperty({ description: 'Мощность двигателя (в л.с.)' })
  @Expose()
  enginePower!: number;

  @ApiProperty({ description: 'Крутящий момент (в Нм)' })
  @Expose()
  engineTorque!: number;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'Количество цилиндров (null для электромобилей)',
  })
  @Expose()
  cylindersCount!: number | null;

  @ApiProperty({
    enum: TransmissionType,
    description: 'Тип коробки передач (автомат, механика, робот)',
  })
  @Expose()
  transmission!: TransmissionType;

  @ApiProperty({
    enum: DriveType,
    description: 'Тип привода (передний, задний, полный)',
  })
  @Expose()
  driveType!: DriveType;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: string | Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt!: string | Date;
}
