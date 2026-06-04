import { defineStore } from "pinia";
import type { BrandResponse, CarModelResponse, CreateDriveTestRequest } from "@car/types";
import { fetchBrands } from "@/services/brand.service";
import { fetchCarModels } from "@/services/model.service";
import { createDriveTest } from "@/services/test-drive.service";

export const useDriveTestStore = defineStore("drive-test", {
  state: () => ({
    brands: [] as BrandResponse[],
    models: [] as CarModelResponse[],
    selectedBrandId: "" as string,
    selectedModelId: "" as string,
    clientPhone: "" as string,
    scheduledAt: "" as string,
    isLoading: false,
    submitLoading: false,
    error: "" as string,
    success: "" as string,
  }),
  getters: {
    filteredModels(state) {
      if (!state.selectedBrandId) {
        return state.models;
      }
      return state.models.filter(model => model.brandId === state.selectedBrandId);
    },
  },
  actions: {
    async loadOptions() {
      this.isLoading = true;
      try {
        if (!this.brands.length) {
          this.brands = await fetchBrands();
        }
        if (!this.models.length) {
          this.models = await fetchCarModels(1, 100);
        }
      } finally {
        this.isLoading = false;
      }
    },

    setBrand(brandId: string) {
      this.selectedBrandId = brandId;
      if (this.selectedBrandId && this.selectedModelId) {
        const model = this.models.find(item => item.id === this.selectedModelId);
        if (model?.brandId !== this.selectedBrandId) {
          this.selectedModelId = "";
        }
      }
    },

    setModel(modelId: string) {
      this.selectedModelId = modelId;
    },

    setPhone(phone: string) {
      this.clientPhone = phone;
    },

    setScheduledAt(value: string) {
      this.scheduledAt = value;
    },

    clearForm() {
      this.selectedBrandId = "";
      this.selectedModelId = "";
      this.clientPhone = "";
      this.scheduledAt = "";
      this.error = "";
      this.success = "";
    },

    async submit() {
      this.error = "";
      this.success = "";
      if (!this.selectedModelId) {
        this.error = "Выберите модель автомобиля.";
        return false;
      }
      if (!this.clientPhone.trim()) {
        this.error = "Укажите номер телефона.";
        return false;
      }

      const payload: CreateDriveTestRequest = {
        carModelId: this.selectedModelId,
        clientPhone: this.clientPhone.trim(),
        scheduledAt: this.scheduledAt || undefined,
      };

      this.submitLoading = true;
      try {
        await createDriveTest(payload);
        this.success = "Заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.";
        this.clearForm();
        return true;
      } catch (error) {
        this.error = "Не удалось отправить заявку. Попробуйте ещё раз.";
        return false;
      } finally {
        this.submitLoading = false;
      }
    },
  },
});
