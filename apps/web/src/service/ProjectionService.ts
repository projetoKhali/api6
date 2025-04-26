import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

interface AgriculturalData {
  crop: string;
  crop_year: number;
  season: Season;
  state: string;
  area: number;
  production: number;
  annual_rainfall: number;
  fertilizer: number;
  pesticide: number;
  yield: number;
}

interface AgriculturalFilters {
  crop_year?: number;
  crop?: string;
  season?: Season;
  state?: string;
  min_yield?: number;
  max_yield?: number;
}

interface AgriculturalDataResponse {
  data: AgriculturalData[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.agriculture.com/v1',
  timeout: 10000,
});

class AgriculturalDataService {
  static async getAgriculturalData(
    filters: AgriculturalFilters = {},
    signal?: AbortSignal
  ): Promise<AgriculturalDataResponse> {
    try {
      const config: AxiosRequestConfig = {
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await api.post('/agricultural-data', filters, config);
      return response.data;
    } catch (error) {
      if (this.isApiError(error)) {
        throw this.handleApiError(error);
      }
      throw this.handleUnexpectedError(error);
    }
  }

  private static isApiError(error: unknown): error is AxiosError<ErrorResponse> {
    return axios.isAxiosError(error) && error.response !== undefined;
  }

  private static handleApiError(error: AxiosError<ErrorResponse>): ErrorResponse {
    if (error.response) {
      return {
        message: error.response.data.message || 'Erro desconhecido na API',
        code: error.response.data.code,
        details: error.response.data.details,
      };
    } else if (error.request) {
      return {
        message: 'Não foi possível conectar ao servidor',
        code: 'NETWORK_ERROR',
      };
    } else {
      return {
        message: 'Erro na configuração da requisição',
        code: 'REQUEST_ERROR',
      };
    }
  }

  private static handleUnexpectedError(error: unknown): ErrorResponse {
    console.error('Erro inesperado:', error);
    return {
      message: 'Ocorreu um erro inesperado',
      code: 'UNEXPECTED_ERROR',
    };
  }

  static async getMockedAgriculturalData(
    filters: AgriculturalFilters = {}
  ): Promise<AgriculturalDataResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockData: AgriculturalData[] = [
      {
        crop: 'Soja',
        crop_year: 2023,
        season: 'Summer',
        state: 'Paraná',
        area: 1500,
        production: 675000,
        annual_rainfall: 1200,
        fertilizer: 3000,
        pesticide: 450,
        yield: 450,
      },
      {
        crop: 'Milho',
        crop_year: 2023,
        season: 'Summer',
        state: 'Mato Grosso',
        area: 2000,
        production: 900000,
        annual_rainfall: 1100,
        fertilizer: 4000,
        pesticide: 600,
        yield: 450,
      },
    ];

    const filteredData = mockData.filter(item => {
      return (
        (!filters.crop || item.crop.toLowerCase().includes(filters.crop.toLowerCase())) &&
        (!filters.crop_year || item.crop_year === filters.crop_year) &&
        (!filters.season || item.season === filters.season) &&
        (!filters.state || item.state.toLowerCase().includes(filters.state.toLowerCase())) &&
        (!filters.min_yield || item.yield >= filters.min_yield) &&
        (!filters.max_yield || item.yield <= filters.max_yield)
      );
    });

    return {
      data: filteredData,
      pagination: {
        total: filteredData.length,
        page: 1,
        pageSize: filteredData.length,
      },
    };
  }
}

export { AgriculturalDataService };
export type { AgriculturalData, AgriculturalFilters, AgriculturalDataResponse, ErrorResponse };