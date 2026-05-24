import { GetStaffRequest } from '@car/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetStaffDto implements GetStaffRequest {
  @ApiProperty({
    description: 'Id работника',
    example: '123-abc',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;
}
