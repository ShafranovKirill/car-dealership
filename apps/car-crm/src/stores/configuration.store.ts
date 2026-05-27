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

    async create(dto: CreateConfigurationRequest) {
      const { data } = await api.post<ConfigurationResponse>("/admin/configuration/create", dto);
      this.items.push(data);
      return data;
    },

    async update(dto: UpdateConfigurationRequest) {
      const { data } = await api.patch<ConfigurationResponse>("/admin/configuration/update", dto);
      const idx = this.items.findIndex(i => i.id === data.id);
      if (idx !== -1) this.items.splice(idx, 1, data);
      return data;
    },

    async remove(configurationId: string) {
      await api.delete(`/admin/configuration/delete/${configurationId}`);
      this.items = this.items.filter(i => i.id !== configurationId);
    },
  },
});
