export type Season = 'Whole Year' | 'Spring' | 'Autumn' | 'Summer' | 'Winter';

export type Yield = {
  crop: string;
  crop_year: string;
  season: Season;
  state: string;
  area: number;
  production: number;
  annual_rainfall: number;
  fertilizer: number;
  pesticide: number;
  yield_: number;
};
