import { PhotoKey } from '@car/common';
import { ConfigurationResponse } from '@car/types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReadConfigurationDto implements ConfigurationResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty()
  @Expose()
  price!: number;

  @ApiProperty()
  @Expose()
  description!: string;

  @ApiProperty()
  @Expose()
  carModelId!: string;

  @ApiProperty({
    description: 'Объект фото конфигурации (ключ: тип фото, значение: ключ S3)',
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  @Expose()
  images!: Record<PhotoKey, string>;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  createdAt!: string | Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  updatedAt!: string | Date;
}
