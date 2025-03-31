import { processGET, processPOST, processRequest } from './service';
import { Yield } from '../schemas/yield';

export const getAllYields = async (): Promise<Yield[]> => {
  return await processGET<Yield[]>(`/yield`);
};

export const createYield = async (data: Yield): Promise<Yield> => {
  return await processPOST<Yield, Yield>(`/yield`, data);
};

export const updateYield = async (
  id: string,
  updatedFields: Partial<Yield>
): Promise<Yield> => {
  return await processRequest<Partial<Yield>, Yield>(
    'PUT',
    `/yield/${id}`,
    updatedFields
  );
};
