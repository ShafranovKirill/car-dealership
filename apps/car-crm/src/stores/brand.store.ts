import { defineStore } from "pinia";
import type { BrandResponse, CreateBrandRequest, UpdateBrandRequest } from "@car/types";
import api from "@/api/axios";

export const useBrandStore = defineStore("brand", {
  state: () => ({
    brands: [] as BrandResponse[],
    isLoading: false,
  }),

  actions: {
    async fetchAll() {
      this.isLoading = true;
      try {
        const { data } = await api.get<BrandResponse[]>("/admin/brand/all");
        this.brands = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return this.brands;
      } finally {
        this.isLoading = false;
      }
    },

    async create(dto: CreateBrandRequest) {
      const { data } = await api.post<BrandResponse>("/admin/brand/create", dto);
      this.brands.push(data);
      return data;
    },

    async update(dto: UpdateBrandRequest) {
      const { data } = await api.patch<BrandResponse>("/admin/brand/update", dto);
      const idx = this.brands.findIndex(b => b.id === data.id);
      if (idx !== -1) this.brands.splice(idx, 1, data);
      return data;
    },

    async remove(brandId: string) {
      await api.delete(`/admin/brand/delete/${brandId}`);
      this.brands = this.brands.filter(b => b.id !== brandId);
    },

    async uploadPhoto(brandId: string, file: File, socketId: string) {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/admin/brand/${brandId}/photo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { socketId },
      });
      await this.fetchAll();
    },
  },
});
