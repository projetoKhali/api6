export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type SeasonExpanded = Season | 'Whole Year';

// Interface para cada item de dados agrícolas
export interface AgriculturalData {
  _id: string;
  annual_rainfall: number;
  area: number;
  crop: string;
  crop_year: number;
  fertilizer: number;
  pesticide: number;
  production: number;
  season: SeasonExpanded;
  state: string;
  yield: number;
}

// Interface para os totais por estação
interface SeasonTotalsStrict {
  Spring?: number[];
  Summer?: number[];
  Autumn?: number[];
  Winter?: number[];
  production_average?: number[];
  total: number[];
  years: number[];
}

interface Calculations {
  item_count: number; // Quantidade total de itens
  total_production: number; // Soma total da produção
}

export interface StatesTotals {
  state: string;
  total_production: number;
  efficiency: number;
  total_area: number;
}

export interface filterListSchema {
  crop_years: string[];
  seasons: string[];
  states: string[];
  crops: string[];
}

export interface YieldDataResponse {
  calculations: Calculations;
  data: AgriculturalData[];
  season_totals: SeasonTotalsStrict;
  states_totals: StatesTotals[];
  yearly_crop_stats: YearlyCropStatistics;
  metrics: Metrics;
  crops_totals: cropsTotalsSchema[];
}

interface CropStatistics {
  crop: string;
  total_production: number;
  avg_area: number;
  total_fertilizer: number;
  total_pesticide: number;
  avg_rainfall: number;
}

type YearlyCropStatistics = {
  [year: number]: CropStatistics[];
};

export interface Metrics {
  production_efficiency: number;
  total_cultivated_area: number;
  total_production: number;
  total_species: number;
  total_states: number;
}

export interface cropsTotalsSchema {
  crop: string;
  efficiency: number;
  total_area: number;
  total_production: number;
}
