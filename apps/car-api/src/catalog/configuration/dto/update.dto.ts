import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateConfigurationRequestDto } from './create.dto.js';
import { UpdateConfigurationRequest } from '@car/types';

export class UpdateConfigurationRequestDto
  extends PartialType(
    OmitType(CreateConfigurationRequestDto, ['carModelId'] as const),
  )
  implements UpdateConfigurationRequest
{
  @ApiProperty({
    description: 'ID обновляемой конфигурации',
    example: '7d2e0b12-9c3a-4f1e-8d5c-1a2b3c4d5e6f',
  })
  @IsUUID()
  @IsNotEmpty()
  configurationId!: string;
}
