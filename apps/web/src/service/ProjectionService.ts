import { filterListSchema } from '../schemas/DashboardSchema';
import { PredictCustomResponseItem } from '../schemas/ProjectionSchema';
import { FilterParams } from './DashboardService';
import { processGET, processPOST } from './service';

export async function fetchYielPredictiondData(
  filters: FilterParams = {}
): Promise<PredictCustomResponseItem[]> {
  const body = {
    ...(filters.crop_year && { crop_year: filters.crop_year }),
    ...(filters.season && { season: filters.season }),
    ...(filters.crop && { crop: filters.crop }),
    ...(filters.state && { state: filters.state }),
  };

  return await processPOST<FilterParams, PredictCustomResponseItem[]>({
    path: '/projection/',
    body,
  });
}

export async function getFilterData(): Promise<filterListSchema> {
  return await processGET<filterListSchema>('/projection/filters');
}
