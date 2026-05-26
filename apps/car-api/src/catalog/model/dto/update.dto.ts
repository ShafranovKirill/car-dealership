import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateCarModelRequestDto } from './create.dto.js';
import { UpdateCarModelRequest } from '@car/types';

export class UpdateCarModelRequestDto
  extends PartialType(CreateCarModelRequestDto)
  implements UpdateCarModelRequest
{
  @ApiProperty({
    description: 'ID обновляемой модели автомобиля',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  @IsNotEmpty()
  modelId!: string;
}
