import {
  ApiPropertyOptional,
  ApiProperty,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCarModelRequestDto } from './create.dto.js';
import { UpdateCarModelRequest } from '@car/types';
import { UpdateCarTechnicalInfoRequestDto } from './update-info.dto.js';

export class UpdateCarModelRequestDto
  extends PartialType(
    OmitType(CreateCarModelRequestDto, ['technicalInfo'] as const),
  )
  implements UpdateCarModelRequest
{
  @ApiProperty({
    description: 'ID обновляемой модели автомобиля',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  @IsNotEmpty()
  modelId!: string;

  @ApiPropertyOptional({
    description: 'Частичное обновление технических характеристик',
    type: () => UpdateCarTechnicalInfoRequestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCarTechnicalInfoRequestDto)
  technicalInfo?: UpdateCarTechnicalInfoRequestDto;
}
