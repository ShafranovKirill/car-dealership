import { CarModelFullResponse } from '@car/types';
import { CarModelResponseDto } from './read-model.dto.js';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CarTechnicalInfoResponseDto } from './read-info.dto.js';
import { ReadConfigurationDto } from '../../configuration/dto/read.dto.js';

export class CarModelFullResponseDto
  extends CarModelResponseDto
  implements CarModelFullResponse
{
  @ApiPropertyOptional({
    type: () => CarTechnicalInfoResponseDto,
    nullable: true,
  })
  @Expose()
  @Type(() => CarTechnicalInfoResponseDto)
  technicalInfo?: CarTechnicalInfoResponseDto | null;

  @ApiPropertyOptional({
    type: () => ReadConfigurationDto,
    isArray: true,
  })
  @Expose()
  configurations?: ReadConfigurationDto[];
}
