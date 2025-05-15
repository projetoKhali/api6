import {
  CustomPredictionRequest,
  CustomPredictionResponse,
} from '../schemas/ProjectionCostumSchema';
import { API_PREDICTION_URL, processPOST } from './service';

export async function fetchCustomPrediction(
  body: CustomPredictionRequest
): Promise<CustomPredictionResponse[]> {
  return await processPOST<CustomPredictionRequest, CustomPredictionResponse[]>(
    {
      path: '/predict/custom',
      body,
      overrideURL: API_PREDICTION_URL,
    }
  );
}
