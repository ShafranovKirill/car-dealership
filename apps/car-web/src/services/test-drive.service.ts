import type { CreateDriveTestRequest, DriveTestResponse } from "@car/types";
import { api } from "./api";

export async function createDriveTest(dto: CreateDriveTestRequest): Promise<DriveTestResponse> {
  const { data } = await api.post<DriveTestResponse>("/test-drive", dto);
  return data;
}
