import type { CarModelResponse } from '@car/types'
import { api } from './api'

export async function fetchCarModels(page = 1, perPage = 8): Promise<CarModelResponse[]> {
  const { data } = await api.get<CarModelResponse[]>('/model/all', {
    params: { page, perPage },
  })
  return data
}

export async function fetchCarModelById(modelId: string): Promise<CarModelResponse> {
  const { data } = await api.get<CarModelResponse>(`/model/${modelId}`)
  return data
}
