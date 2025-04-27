type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

type RangeFilter = {
  min?: number;
  max?: number;
};

type SortOptions = {
  field: keyof AgriculturalData;
  direction: 'asc' | 'desc';
};

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
  filters?: AgriculturalFilters;
}

interface AgriculturalSummary {
  averageYield: number;
  totalArea: number;
  totalProduction: number;
  cropCount: number;
  bySeason: Record<Season, {
    count: number;
    averageYield: number;
  }>;
}

function isAgriculturalData(data: any): data is AgriculturalData {
  return (
    typeof data === 'object' &&
    typeof data.crop === 'string' &&
    typeof data.crop_year === 'number' &&
    ['Spring', 'Summer', 'Autumn', 'Winter'].includes(data.season) &&
    typeof data.state === 'string' &&
    typeof data.area === 'number' &&
    typeof data.production === 'number' &&
    typeof data.annual_rainfall === 'number' &&
    typeof data.fertilizer === 'number' &&
    typeof data.pesticide === 'number' &&
    typeof data.yield === 'number'
  );
}


export interface PredictCustomRequest {
  state?: string;
  crop?: string;
  season?: string;
  area?: number;
  fertilizer?: number;
  pesticide?: number;
  annual_rainfall?: number;
  year?: number;
}

export interface PredictCustomResponseItem {
  Annual_Rainfall: number;
  Area: number;
  Crop: string;
  Predicted_Fertilizer: number;
  Predicted_Pesticide: number;
  Predicted_Production: number;
  Season: string;
  State: string;
  Year: number;
}
