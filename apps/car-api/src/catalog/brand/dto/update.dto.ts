import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateBrandDto } from './create.dto.js';
import { UpdateBrandRequest } from '@car/types';

export class UpdateBrandDto
  extends PartialType(CreateBrandDto)
  implements UpdateBrandRequest
{
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  brandId!: string;
}
