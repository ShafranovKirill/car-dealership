import { PhotoKey } from '@car/common';

export enum ProjectEvent {
  AUTH_CODE_REQUESTED = 'auth-code.requested',
  BRAND_PHOTO_CONVERTED = 'brand.photo.converted',
  BRAND_PHOTO_CONVERSION_FAILED = 'brand.photo.conversion.failed',
  MODEL_PHOTO_CONVERTED = 'model.photo.converted',
  MODEL_PHOTO_CONVERSION_FAILED = 'model.photo.conversion.failed',
  CONFIGURATION_PHOTO_CONVERTED = 'configuration.photo.converted',
  CONFIGURATION_PHOTO_CONVERSION_FAILED = 'configuration.photo.conversion.failed',
  CLIENT_LOGGED_IN = 'client.logged.in',
  STAFF_LOGGED_IN = 'staff.logged.in',
}

export interface ClientLoggedInEvent {
  clientId: string;
  sessionId: string;
}

export type PhotoMap = Partial<Record<PhotoKey, string>>;

export interface PhotoConversionEvent {
  targetId: string;
  socketId: string;
  photos: PhotoMap;
}

export interface PhotoConversionFailedEvent {
  fileId: string;
  error: string;
  socketId: string;
}
