import { CreateConfigurationRequest } from '@car/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateConfigurationRequestDto implements CreateConfigurationRequest {
  @ApiProperty({ example: 'M Sport Pro' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 6500000 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({
    example:
      'Максимальная комплектация с пакетом Shadowline и аудиосистемой Harman Kardon',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  carModelId!: string;
}
