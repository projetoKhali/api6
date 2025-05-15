import {
  filterListSchema,
  YieldDataResponse,
} from '../schemas/DashboardSchema';
import { processGET, processPOST } from './service';

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

  return await processPOST<FilterParams, YieldDataResponse>({
    path: '/dashboard/',
    body: requestBody,
  });
}

export async function getFilterData(): Promise<filterListSchema> {
  return await processGET<filterListSchema>('/dashboard/filters');
}
