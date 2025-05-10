import {
  processGET,
  processPaginatedGET,
  processPOST,
  processRequest,
} from './service';
import { Yield } from '../schemas/yield';
import { Page } from '../schemas/pagination';

export const getAllYields = async (): Promise<Yield[]> => {
  return await processGET<Yield[]>(`/yield/all`);
};

export const getYields = async (
  page: number,
  size = 50
): Promise<Page<Yield>> => {
  return await processPaginatedGET(`/yield/`, page, size);
};

export const reportYields = async (
  page: number,
  size = 50,
  crop_year?: number | number[],
  season?: string | string[],
  crop?: string | string[],
  state?: string | string[]
): Promise<Page<Yield>> => {
  return await processPaginatedGET(`/yield/filter`, page, size, crop_year, season, crop, state);
};

export const createYield = async (data: Yield): Promise<Yield> => {
  return await processPOST<Yield, Yield>(`/yield/create`, data);
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
