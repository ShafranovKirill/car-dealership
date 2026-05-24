import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCarModelRequest } from '@car/types';
import { BodyType, CarClass } from '../../../../generated/prisma/client.js';
import { CreateCarTechnicalInfoRequestDto } from './create-info.dto.js';

export class CreateCarModelRequestDto implements CreateCarModelRequest {
  @ApiProperty({ example: '5 Series' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'G30 LCI' })
  @IsString()
  @IsNotEmpty()
  generation!: string;

  @ApiProperty({ example: 2020 })
  @IsNumber()
  @Min(1800)
  yearFrom!: number;

  @ApiPropertyOptional({ example: 2023 })
  @IsNumber()
  @Min(1800)
  @IsOptional()
  yearTo?: number;

  @ApiProperty({ enum: BodyType, example: BodyType.SEDAN })
  @IsEnum(BodyType)
  bodyType!: BodyType;

  @ApiProperty({ enum: CarClass, example: CarClass.E })
  @IsEnum(CarClass)
  carClass!: CarClass;

  @ApiProperty({ example: 5000000 })
  @IsNumber()
  @Min(0)
  minPrice!: number;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  brandId!: string;

  @ApiPropertyOptional({ type: () => CreateCarTechnicalInfoRequestDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCarTechnicalInfoRequestDto)
  technicalInfo?: CreateCarTechnicalInfoRequestDto;
}
