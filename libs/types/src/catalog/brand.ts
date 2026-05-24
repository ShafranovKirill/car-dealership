import { PhotoKey } from "@common/photo-keys.js";
import { CarModelResponse } from "./model.js";

export interface FindBrandRequest {
  id: string;
}

export interface FindBrandByNameRequest {
  name: string;
}

export interface BrandResponse {
  id: string;
  name: string;
  images: Record<PhotoKey, string>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BrandWithModelsResponse extends BrandResponse {
  carModels: CarModelResponse[];
}

export interface CreateBrandRequest {
  name: string;
  logo: string;
}

export type UpdateBrandRequest = Partial<CreateBrandRequest> & {
  brandId: string;
};
