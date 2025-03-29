import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:5000/yields";

export const YieldService = {
  // Buscar todos os registros
  async getAll(): Promise<any[]> {
    const response = await axios.get(API_BASE_URL);
    return response.data.data;
  },

  // Criar um novo registro
  async create(data: Record<string, any>): Promise<any> {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  },

  // Atualizar um registro existente
  async update(id: string, updatedFields: Partial<Record<string, any>>): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updatedFields);
    return response.data;
  }
};
