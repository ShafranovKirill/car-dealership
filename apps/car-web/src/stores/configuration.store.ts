import { defineStore } from "pinia";
import type { ConfigurationResponse } from "@car/types";
import { fetchConfigurationsByModel } from "@/services/configuration.service";

export const useConfigurationStore = defineStore("configuration", {
  state: () => ({
    configurations: [] as ConfigurationResponse[],
    isLoading: false,
  }),
  actions: {
    async fetchByModelId(modelId: string) {
      this.isLoading = true;
      try {
        const data = await fetchConfigurationsByModel(modelId);
        this.configurations = data;
        return data;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
