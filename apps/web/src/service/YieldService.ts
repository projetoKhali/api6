import axios from 'axios';
import { API_BASE_URL } from './service';

export const YieldService = {
  async getAll(): Promise<any[]> {
    const response = await axios.get(`${API_BASE_URL}/yields`);
    return response.data.data;
  },

  async create(data: Record<string, any>): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/yields`, data);
    return response.data;
  },

  async update(
    id: string,
    updatedFields: Partial<Record<string, any>>
  ): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updatedFields);
    return response.data;
  },
};
