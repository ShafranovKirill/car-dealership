import { PhotoKey } from "@common/photo-keys.js";
import { BrandResponse } from "./brand.js";
import { ConfigurationResponse } from "./configuration.js";
import { BodyType, CarClass, DriveType, EngineType, TransmissionType } from "@prisma-generated/prisma/client.js";

export interface CarTechnicalInfoResponse {
  id: string;
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
  engineId: string;
  carModelId: string;
}

export interface CreateCarTechnicalInfoRequest {
  carModelId: string;
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

export interface CarModelResponse {
  id: string;
  name: string;
  generation: string;
  yearFrom: number;
  yearTo?: number | null;
  bodyType: BodyType;
  carClass: CarClass;
  images: Record<PhotoKey, string>;
  minPrice: number;
  brandId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CarModelFullResponse extends CarModelResponse {
  technicalInfo?: CarTechnicalInfoResponse | null;
  configurations?: ConfigurationResponse[];
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
  technicalInfo?: CreateCarTechnicalInfoRequest;
}

export type UpdateCarModelRequest = Partial<Omit<CreateCarModelRequest, "technicalInfo">> & {
  modelId: string;
  technicalInfo?: Partial<CreateCarTechnicalInfoRequest>;
};
