import { PhotoKey } from '@car/common';
import { BrandResponse } from '@car/types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ReadBrandDto implements BrandResponse {
  @ApiProperty()
  @Expose()
  id!: string;

  @ApiProperty()
  @Expose()
  name!: string;

  @ApiProperty({
    description:
      'Объект изображений бренда (ключ: тип фото, значение: ключ S3)',
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
