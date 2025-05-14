import {
  CustomPredictionRequest,
  CustomPredictionResponse,
} from '../schemas/ProjectionCostumSchema';
import { processPOST } from './service';

export async function fetchCustomPrediction(
  data: CustomPredictionRequest
): Promise<CustomPredictionResponse[]> {
  return await processPOST<CustomPredictionRequest, CustomPredictionResponse[]>(
    '/api/predict/custom',
    data,
    'http://127.0.0.1:9000'
  );
}
