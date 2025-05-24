import {
  CreateTermRequest,
  NewTermVersionRequest,
  ActiveTermResponse,
  UserAcceptanceRequest,
  UpdateAcceptanceRequest,
  ComplianceResponse,
  TermResponse,
} from '../schemas/TermsSchema';

import {
  processGET,
  processPOST,
  processRequest,
  API_BASE_URL } from './service';
  
const TERMS_BASE_PATH = '/terms';

export class TermsService {
  static async createTerm(data: CreateTermRequest): Promise<TermResponse> {
    return await processPOST({
      path: `${TERMS_BASE_PATH}/new`,
      body: data,
    });
  }

  static async listTerms(): Promise<TermResponse[]> {
    return await processGET({
      path: TERMS_BASE_PATH,
    });
  }

  static async acceptTerms(data: UserAcceptanceRequest): Promise<{ success: boolean }> {
    return await processPOST({
      path: `${TERMS_BASE_PATH}/user/accept`,
      body: data,
    });
  }

  static async getActiveTerm(): Promise<ActiveTermResponse> {
    return await processGET({
      path: `${TERMS_BASE_PATH}/active`,
    });
  }

  static async createNewVersion(data: NewTermVersionRequest): Promise<TermResponse> {
    return await processPOST({
      path: `${TERMS_BASE_PATH}/new-version`,
      body: data,
    });
  }

  // static async updateUserAcceptance(userId: string, data: UpdateAcceptanceRequest): Promise<{ success: boolean }> {
  //   return await processRequest<'PUT', { success: boolean }>('PUT', {
  //     path: `${TERMS_BASE_PATH}/user/update/${userId}`,
  //     body: data,
  //   });
  // }

  static async checkCompliance(userId: string): Promise<ComplianceResponse> {
    return await processGET({
      path: `${TERMS_BASE_PATH}/user/compliance/${userId}`,
    });
  }

  static async hasUserAcceptedTerms(userId: string): Promise<boolean> {
    try {
      const response = await processGET<{ 
        _id: string; 
        topics: { accepted: boolean; description: string; status: string }[]; 
        user_id: string; 
      }>({
        path: `${TERMS_BASE_PATH}/user/${userId}`,
      });

      if (!response || !response.topics || response.topics.length === 0) {
        // Sem dados, retorna false
        return false;
      }

      // Se algum termo ativo não foi aceito, retorna false
      const hasRejectedActiveTerm = response.topics.some(
        (topic) => topic.status === 'ativo' && topic.accepted === false
      );

      if (hasRejectedActiveTerm) {
        return false;
      }

      // Caso contrário, todos os termos ativos estão aceitos, retorna true
      return true;
    } catch (error) {
      // Caso de erro na requisição, considera que usuário não aceitou
      return false;
    }
  }
}

