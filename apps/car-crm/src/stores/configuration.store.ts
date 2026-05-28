import { defineStore } from "pinia";
import type { ConfigurationResponse, CreateConfigurationRequest, UpdateConfigurationRequest } from "@car/types";
import api from "@/api/axios";

export const useConfigurationStore = defineStore("configuration", {
  state: () => ({
    items: [] as ConfigurationResponse[],
    isLoading: false,
  }),
  actions: {
    async fetchAll() {
      this.isLoading = true;
      try {
        const { data } = await api.get<ConfigurationResponse[]>("/admin/configuration/all");
        this.items = data;
        return data;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchByModelId(modelId: string) {
      this.isLoading = true;
      try {
        const { data } = await api.get<ConfigurationResponse[]>(`/admin/configuration/model/${modelId}`);
        this.items = data;
        return data;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOne(configurationId: string) {
      try {
        const { data } = await api.get<ConfigurationResponse>(`/admin/configuration/${configurationId}`);
        return data;
      } catch (error) {
        console.error("Failed to fetch configuration:", error);
        throw error;
      }
    },

    async create(dto: CreateConfigurationRequest) {
      const { data } = await api.post<ConfigurationResponse>("/admin/configuration/create", dto);
      this.items.push(data);
      return data;
    },

    async update(id: string, dto: Partial<UpdateConfigurationRequest>) {
      const { data } = await api.patch<ConfigurationResponse>("/admin/configuration/update", { id, ...dto });
      const idx = this.items.findIndex(i => i.id === data.id);
      if (idx !== -1) this.items.splice(idx, 1, data);
      return data;
    },

    async remove(configurationId: string) {
      await api.delete(`/admin/configuration/delete/${configurationId}`);
      this.items = this.items.filter(i => i.id !== configurationId);
    },

    async uploadPhoto(configurationId: string, file: File) {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<ConfigurationResponse>(
        `/admin/configuration/${configurationId}/photo`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const idx = this.items.findIndex(i => i.id === configurationId);
      if (idx !== -1) this.items.splice(idx, 1, data);
      return data;
    },

    async deletePhoto(configurationId: string, photoKey: string) {
      const { data } = await api.delete<ConfigurationResponse>(
        `/admin/configuration/${configurationId}/photo?photoKey=${photoKey}`,
      );
      const idx = this.items.findIndex(i => i.id === configurationId);
      if (idx !== -1) this.items.splice(idx, 1, data);
      return data;
    },
  },
});
