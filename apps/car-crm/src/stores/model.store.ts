import { defineStore } from "pinia";
import type { CarModelResponse, CreateCarModelRequest, UpdateCarModelRequest } from "@car/types";
import api from "@/api/axios";

export const useModelStore = defineStore("model", {
  state: () => ({
    models: [] as CarModelResponse[],
    isLoading: false,
  }),
  actions: {
    async fetchAll() {
      this.isLoading = true;
      try {
        const { data } = await api.get<CarModelResponse[]>("/admin/model/all");
        this.models = data;
        return data;
      } finally {
        this.isLoading = false;
      }
    },

    async create(dto: CreateCarModelRequest) {
      const { data } = await api.post<CarModelResponse>("/admin/model/create", dto);
      this.models.push(data);
      return data;
    },

    async update(dto: UpdateCarModelRequest) {
      const { data } = await api.patch<CarModelResponse>("/admin/model/update", dto);
      const idx = this.models.findIndex(m => m.id === data.id);
      if (idx !== -1) this.models.splice(idx, 1, data);
      return data;
    },

    async remove(modelId: string) {
      await api.delete(`/admin/model/delete/${modelId}`);
      this.models = this.models.filter(m => m.id !== modelId);
    },

    async uploadPhoto(modelId: string, file: File, socketId: string) {
      const fd = new FormData();
      fd.append("file", file);
      await api.post(`/admin/model/${modelId}/photo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { socketId },
      });
      await this.fetchAll();
    },

    async deletePhoto(modelId: string, fileKey: string) {
      await api.delete(`/admin/model/${modelId}/photo`, { params: { fileKey } });
      await this.fetchAll();
    },
  },
});
