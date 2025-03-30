import {
  filterListSchema,
  YieldDataResponse,
} from '../schemas/DashboardSchema';

// Adicione esta interface para os parâmetros de filtro
export interface FilterParams {
  crop_year?: number | number[];
  season?: string | string[];
  crop?: string | string[];
  state?: string | string[];
}

// Função de exemplo para consumir a API
export async function fetchYieldData(
  filters: FilterParams = {}
): Promise<YieldDataResponse> {
  // Prepara o corpo da requisição
  const requestBody: any = {};

  // Adiciona apenas os filtros que existem
  if (filters.crop_year) requestBody.crop_year = filters.crop_year;
  if (filters.season) requestBody.season = filters.season;
  if (filters.crop) requestBody.crop = filters.crop;
  if (filters.state) requestBody.state = filters.state;

  const response = await fetch('http://127.0.0.1:5000/api/get_yield_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('Erro na requisição');
  }

  return await response.json();
}

export async function getFilterData(): Promise<filterListSchema> {
  const response = await fetch('http://127.0.0.1:5000/api/get_filters', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro na requisição');
  }

  const data: filterListSchema = await response.json();
  return data;
}
