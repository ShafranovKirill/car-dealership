import { defineStore } from "pinia";
import api from "@/api/axios";

export interface DriveTestResponse {
  id: string;
  clientPhone: string;
  status: "NEW" | "CONFIRMED" | "CANCELED";
  carModelId: string;
  carModel?: {
    id: string;
    name: string;
    brand?: {
      id: string;
      name: string;
    };
  };
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDriveTestRequest {
  clientPhone: string;
  carModelId: string;
  scheduledAt?: string;
}

export interface UpdateDriveTestRequest {
  driveTestId: string;
  status?: "NEW" | "CONFIRMED" | "CANCELED";
  scheduledAt?: string;
}

export const useDriveTestStore = defineStore("drive-test", {
  state: () => ({
    driveTests: [] as DriveTestResponse[],
    isLoading: false,
  }),

  getters: {
    newDriveTests(): DriveTestResponse[] {
      return this.driveTests.filter(dt => dt.status === "NEW");
    },

    confirmedDriveTests(): DriveTestResponse[] {
      return this.driveTests.filter(dt => dt.status === "CONFIRMED");
    },

    canceledDriveTests(): DriveTestResponse[] {
      return this.driveTests.filter(dt => dt.status === "CANCELED");
    },
  },

  actions: {
    async fetchAll() {
      this.isLoading = true;
      try {
        const { data } = await api.get<DriveTestResponse[]>("/admin/drive-test/all");
        this.driveTests = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return this.driveTests;
      } finally {
        this.isLoading = false;
      }
    },

    async create(dto: CreateDriveTestRequest) {
      const { data } = await api.post<DriveTestResponse>("/admin/drive-test/create", dto);
      this.driveTests.unshift(data);
      return data;
    },

    async update(dto: UpdateDriveTestRequest) {
      const { data } = await api.patch<DriveTestResponse>("/admin/drive-test/update", dto);
      const idx = this.driveTests.findIndex(dt => dt.id === data.id);
      if (idx !== -1) this.driveTests.splice(idx, 1, data);
      return data;
    },

    async remove(driveTestId: string) {
      await api.delete(`/admin/drive-test/delete/${driveTestId}`);
      this.driveTests = this.driveTests.filter(dt => dt.id !== driveTestId);
    },
  },
});
