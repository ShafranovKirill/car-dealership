import { DriveTestStatus } from "@prisma-generated/prisma/client.js";

export interface DriveTestResponse {
  id: string;
  clientPhone: string;
  status: DriveTestStatus;
  carModelId: string;
  scheduledAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateDriveTestRequest {
  clientPhone: string;
  carModelId: string;
  scheduledAt?: Date | string | null;
}

export type UpdateDriveTestRequest = Partial<CreateDriveTestRequest> & {
  driveTestId: string;
  status?: DriveTestStatus;
};
