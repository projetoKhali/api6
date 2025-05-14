import {
  CustomPredictionRequest,
  CustomPredictionResponse,
} from '../schemas/ProjectionCostumSchema';
import { API_PREDICTION_URL, processPOST } from './service';

export async function fetchCustomPrediction(
  data: CustomPredictionRequest
): Promise<CustomPredictionResponse[]> {
  return await processPOST<CustomPredictionRequest, CustomPredictionResponse[]>(
    '/predict/custom',
    data,
    API_PREDICTION_URL
  );
}
