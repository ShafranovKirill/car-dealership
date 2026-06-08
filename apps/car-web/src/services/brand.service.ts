import type { BrandResponse } from "@car/types";
import { api } from "./api";

export async function fetchBrands(): Promise<BrandResponse[]> {
  const { data } = await api.get<BrandResponse[]>("/brand/all");
  return data;
}
