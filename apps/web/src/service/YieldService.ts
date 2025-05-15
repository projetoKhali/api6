import {
  processGET,
  processPaginatedGET,
  processPOST,
  processRequest,
} from './service';
import { Yield } from '../schemas/yield';
import { Page } from '../schemas/pagination';

export const getAllYields = async (): Promise<Yield[]> => {
  return await processGET<Yield[]>({
    path: `/yield/all`,
  });
};

export const getYields = async (
  page: number,
  size = 50
): Promise<Page<Yield>> => {
  return await processPaginatedGET({
    path: `/yield/`,
    page,
    size,
  });
};

export const createYield = async (body: Yield): Promise<Yield> => {
  return await processPOST<Yield, Yield>({
    path: `/yield/create`,
    body,
  });
};

export const updateYield = async (
  id: string,
  updatedFields: Partial<Yield>
): Promise<Yield> => {
  return await processRequest<Partial<Yield>, Yield>('PUT', {
    path: `/yield/${id}`,
    body: updatedFields,
  });
};
