import type { PhotoKey } from "@car/common";
import type { BodyType, CarClass, DriveType, EngineType, TransmissionType } from "@prisma/client";

export interface CarModelResponse {
  id: string;
  name: string;
  generation: string;
  yearFrom: number;
  yearTo?: number | null;
  bodyType: BodyType;
  carClass: CarClass;
  images: Record<PhotoKey, string> | null;
  minPrice: number;
  brandId: string;
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  clearance: number;
  trunkVolume: number;
  trunkMaxVolume?: number | null;
  engineType: EngineType;
  engineVolume: number;
  enginePower: number;
  engineTorque: number;
  cylindersCount?: number | null;
  transmission: TransmissionType;
  driveType: DriveType;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCarModelRequest {
  name: string;
  generation: string;
  yearFrom: number;
  yearTo?: number;
  bodyType: BodyType;
  carClass: CarClass;
  minPrice: number;
  brandId: string;
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  clearance: number;
  trunkVolume: number;
  trunkMaxVolume?: number;
  engineType: EngineType;
  engineVolume: number;
  enginePower: number;
  engineTorque: number;
  cylindersCount?: number;
  transmission: TransmissionType;
  driveType: DriveType;
}

export type UpdateCarModelRequest = Partial<CreateCarModelRequest> & {
  modelId: string;
};
