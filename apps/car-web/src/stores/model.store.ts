import { defineStore } from "pinia";
import type { CarModelResponse } from "@car/types";
import { fetchCarModels, fetchCarModelById } from "@/services/model.service";

export const useModelStore = defineStore("model", {
  state: () => ({
    models: [] as CarModelResponse[],
    selectedModel: null as CarModelResponse | null,
    isLoading: false,
  }),
  actions: {
    async fetchAll(page = 1, perPage = 8) {
      this.isLoading = true;
      try {
        const data = await fetchCarModels(page, perPage);
        this.models = data;
        return data;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOne(modelId: string) {
      this.isLoading = true;
      try {
        const data = await fetchCarModelById(modelId);
        this.selectedModel = data;
        return data;
      } finally {
        this.isLoading = false;
      }
    },

    clearSelected() {
      this.selectedModel = null;
    },
  },
});
