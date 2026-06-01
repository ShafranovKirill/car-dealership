import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CreateDriveTestRequestDto } from './create.dto.js';
import { UpdateDriveTestRequest } from '@car/types';
import { DriveTestStatus } from '../../../generated/prisma/client.js';

export class UpdateDriveTestRequestDto
  extends PartialType(CreateDriveTestRequestDto)
  implements UpdateDriveTestRequest
{
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  driveTestId!: string;

  @ApiPropertyOptional({ enum: DriveTestStatus })
  @IsEnum(DriveTestStatus)
  @IsOptional()
  status?: DriveTestStatus;
}
