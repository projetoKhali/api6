import { processGET, processPOST, processRequest } from './service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YieldSchema = any;

export const YieldService = {
  async getAll(): Promise<YieldSchema[]> {
    return await processGET<YieldSchema[]>(`/yields`);
  },

  async create(data: YieldSchema): Promise<YieldSchema> {
    return await processPOST<YieldSchema, YieldSchema>(`/yields`, data);
  },

  async update(
    id: string,
    updatedFields: Partial<YieldSchema>
  ): Promise<YieldSchema> {
    return await processRequest<Partial<YieldSchema>, YieldSchema>(
      'PUT',
      `/yields/${id}`,
      updatedFields
    );
  },
};
