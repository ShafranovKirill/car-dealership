import { PhotoKey } from "@common/photo-keys.js";

export interface BrandResponse {
  id: string;
  name: string;
  images: Record<PhotoKey, string> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateBrandRequest {
  name: string;
}

export type UpdateBrandRequest = Partial<CreateBrandRequest> & {
  brandId: string;
};
