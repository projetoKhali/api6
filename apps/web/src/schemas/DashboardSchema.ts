// Interface para cada item de dados agrícolas
interface AgriculturalData {
    _id: string;
    annual_rainfall: number;
    area: number;
    crop: string;
    crop_year: number;
    fertilizer: number;
    pesticide: number;
    production: number;
    season: string;  // Pode ser 'Spring', 'Summer', 'Autumn', 'Winter', etc.
    state: string;
    yield: number;
  }
  
  // Interface para os totais por estação
  interface SeasonTotalsStrict {
    Spring?: number[];
    Summer?: number[];
    Autumn?: number[];
    Winter?: number[];
    // Adicione outras estações conforme necessário
    total: number[];
    years: number[];
  }
  
  interface Calculations {
    item_count: number;         // Quantidade total de itens
    total_production: number;   // Soma total da produção
  }

  export interface StatesTotals{
    state: string;
    total_production: number
  }

  export interface filterListSchema{
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
  }