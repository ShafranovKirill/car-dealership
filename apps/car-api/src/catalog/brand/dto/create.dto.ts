import { CreateBrandRequest } from '@car/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBrandDto implements CreateBrandRequest {
  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
