// Enum de status do termo
export enum TermStatus {
    ACTIVE = 'ativo',
    INACTIVE = 'inativo',
  }
  
  // Tipo base para tópicos do termo
  export interface TermTopic {
    description: string;
    status: TermStatus;
    required: boolean;
  }
  
  // Tipo para tópicos aceitos por usuário
  export interface AcceptedTopic {
    description: string;
    status: TermStatus;
    accepted: boolean;
  }
  
  // 1. POST /terms/new - Criar novo termo
  export interface CreateTermRequest {
    text: string;
    status: TermStatus;
    topics: TermTopic[];
  }
  
  // 2. GET /terms/ - Listar todos os termos
  export interface TermResponse {
    id: string;
    text: string;
    status: TermStatus;
    version: string;
    topics: TermTopic[];
  }
  
  // 3. POST /terms/user/accept - Aceitação do usuário
  export interface UserAcceptanceRequest {
    user_id: string;
    topics: AcceptedTopic[];
  }
  
  // 4. GET /terms/active - Obter termo ativo
  export interface ActiveTermResponse extends TermResponse {
    isCurrent: boolean;
  }
  
  // 5. POST /terms/new-version - Criar nova versão
  export interface NewTermVersionRequest {
    text: string;
    topics: TermTopic[];
    version?: string;
  }
  
  // 6. PUT /terms/user/update/<user_id> - Atualizar aceitação
  export interface UpdateAcceptanceRequest {
    topics: AcceptedTopic[];
  }
  
  // 7. GET /terms/user/compliance/<user_id> - Verificar conformidade
  export interface ComplianceResponse {
    isCompliant: boolean;
    pendingTopics: Array<{
      description: string;
      termId: string;
      required: boolean;
    }>;
  }
  