import { PhotoKey } from "@common/photo-keys.js";
import { CarModelResponse } from "./model.js";

export interface BrandResponse {
  id: string;
  name: string;
  images: Record<PhotoKey, string>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateBrandRequest {
  name: string;
}

export type UpdateBrandRequest = Partial<CreateBrandRequest> & {
  brandId: string;
};
