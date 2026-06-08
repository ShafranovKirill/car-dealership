import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CreateDriveTestRequest } from '@car/types';

export class CreateDriveTestRequestDto implements CreateDriveTestRequest {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  carModelId!: string;

  @ApiProperty({ example: '+79211234567' })
  @IsString()
  @IsNotEmpty()
  clientPhone!: string;

  @ApiPropertyOptional({ example: '2026-08-01T14:00:00Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
