import {
  filterListSchema,
  YieldDataResponse,
} from '../schemas/DashboardSchema';
import { API_BASE_URL } from './service';

export interface FilterParams {
  crop_year?: number | number[];
  season?: string | string[];
  crop?: string | string[];
  state?: string | string[];
}

export async function fetchYieldData(
  filters: FilterParams = {}
): Promise<YieldDataResponse> {
  const requestBody = {
    ...(filters.crop_year && { crop_year: filters.crop_year }),
    ...(filters.season && { season: filters.season }),
    ...(filters.crop && { crop: filters.crop }),
    ...(filters.state && { state: filters.state }),
  };

  const response = await fetch(`${API_BASE_URL}/api/get_yield_data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('Erro na requisição');
  }

  return await response.json();
}

export async function getFilterData(): Promise<filterListSchema> {
  const response = await fetch(`${API_BASE_URL}/api/get_filters`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro na requisição');
  }

  const data: filterListSchema = await response.json();
  return data;
}
