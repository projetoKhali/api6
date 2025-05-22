import axios from 'axios';
import {
  CreateTermRequest,
  NewTermVersionRequest,
  ActiveTermResponse,
  UserAcceptanceRequest,
  UpdateAcceptanceRequest,
  ComplianceResponse,
  TermResponse,
} from '../schemas/TermsSchema';

const API_BASE_URL = '/terms';

export class TermsService {
  // 1. Criar novo termo
  static async createTerm(data: CreateTermRequest): Promise<TermResponse> {
    const response = await axios.post(`${API_BASE_URL}/new`, data);
    return response.data;
  }

  // 2. Listar todos os termos
  static async listTerms(): Promise<TermResponse[]> {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  }

  // 3. Aceitação do usuário
  static async acceptTerms(data: UserAcceptanceRequest): Promise<{ success: boolean }> {
    const response = await axios.post(`${API_BASE_URL}/user/accept`, data);
    return response.data;
  }

  // 4. Obter termo ativo
  static async getActiveTerm(): Promise<ActiveTermResponse> {
    const response = await axios.get(`${API_BASE_URL}/active`);
    return response.data;
  }

  // 5. Criar nova versão
  static async createNewVersion(data: NewTermVersionRequest): Promise<TermResponse> {
    const response = await axios.post(`${API_BASE_URL}/new-version`, data);
    return response.data;
  }

  // 6. Atualizar aceitação
  static async updateUserAcceptance(userId: string, data: UpdateAcceptanceRequest): Promise<{ success: boolean }> {
    const response = await axios.put(`${API_BASE_URL}/user/update/${userId}`, data);
    return response.data;
  }

  // 7. Verificar conformidade
  static async checkCompliance(userId: string): Promise<ComplianceResponse> {
    const response = await axios.get(`${API_BASE_URL}/user/compliance/${userId}`);
    return response.data;
  }
}
