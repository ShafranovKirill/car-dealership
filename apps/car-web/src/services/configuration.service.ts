import type { ConfigurationResponse } from '@car/types'
import { api } from './api'

export async function fetchConfigurationsByModel(
  modelId: string,
): Promise<ConfigurationResponse[]> {
  const { data } = await api.get<ConfigurationResponse[]>(`/configuration/model/${modelId}`)
  return data
}
