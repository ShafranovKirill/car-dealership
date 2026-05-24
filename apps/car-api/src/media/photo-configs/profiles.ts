import sharp from 'sharp';

export enum PhotoConvertFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
  AVIF = 'avif',
  HEIF = 'heif',
  GIF = 'gif',
  TIFF = 'tiff',
}

export interface ProductPhotos {
  [profileKey: string]: string | undefined;
}

export type SharpPosition =
  | 'centre'
  | 'center'
  | 'top'
  | 'right top'
  | 'right'
  | 'right bottom'
  | 'bottom'
  | 'left bottom'
  | 'left'
  | 'left top'
  | 'north'
  | 'northeast'
  | 'east'
  | 'southeast'
  | 'south'
  | 'southwest'
  | 'west'
  | 'northwest'
  | 'entropy'
  | 'attention';

export interface PhotoProfile {
  format?: PhotoConvertFormat;
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: SharpPosition;
  quality?: number;
  background?: string | sharp.RGBA;
}

export const PHOTO_PROFILES = {
  PHOTO_XXS: {
    format: PhotoConvertFormat.WEBP,
    width: 100,
    height: 100,
    fit: 'cover' as const,
    position: 'centre',
    quality: 85,
  },

  PHOTO_XS: {
    format: PhotoConvertFormat.WEBP,
    width: 200,
    height: 200,
    fit: 'contain' as const,
    position: 'centre',
    quality: 90,
    background: '#FFFFFF',
  },

  PHOTO_SM: {
    format: PhotoConvertFormat.WEBP,
    width: 400,
    height: 320,
    fit: 'contain' as const,
    position: 'centre',
    quality: 90,
    background: '#FFFFFF',
  },

  PHOTO_MD: {
    format: PhotoConvertFormat.WEBP,
    width: 600,
    height: 480,
    fit: 'contain' as const,
    position: 'centre',
    quality: 90,
    background: '#FFFFFF',
  },

  PHOTO_LG: {
    format: PhotoConvertFormat.WEBP,
    width: 1200,
    height: 960,
    fit: 'contain' as const,
    position: 'centre',
    quality: 85,
    background: '#FFFFFF',
  },
} as const satisfies Record<string, PhotoProfile>;
