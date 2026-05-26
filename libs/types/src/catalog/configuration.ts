import { PhotoKey } from "@common/photo-keys.js";

export interface ConfigurationResponse {
  id: string;
  name: string;
  price: number;
  description: string;
  carModelId: string;
  images: Record<PhotoKey, string>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateConfigurationRequest {
  name: string;
  price: number;
  description: string;
  carModelId: string;
}

export type UpdateConfigurationRequest = Partial<Omit<CreateConfigurationRequest, "carModelId">> & {
  configurationId: string;
};
