/* eslint-disable @typescript-eslint/no-explicit-any */

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'actions';

export interface FieldSchema {
  type: FieldType;
  label: string;
  name: string;
  options?: string[];
}

export const schema: FieldSchema[] = [
  { type: 'text', label: 'Cultura', name: 'crop' },
  { type: 'number', label: 'Ano da Colheita', name: 'crop_year' },
  {
    type: 'select',
    label: 'Estação',
    name: 'season',
    options: ['Summer', 'Spring'],
  },
  { type: 'text', label: 'Estado', name: 'state' },
  { type: 'number', label: 'Área (ha)', name: 'area' },
  { type: 'number', label: 'Produção', name: 'production' },
  { type: 'number', label: 'Chuva Anual (mm)', name: 'annual_rainfall' },
  { type: 'number', label: 'Fertilizante (kg)', name: 'fertilizer' },
  { type: 'number', label: 'Pesticida (kg)', name: 'pesticide' },
  { type: 'number', label: 'Rendimento', name: 'yield' },
];

export const initialValues: Record<string, any> = {
  crop: 'Milho',
  crop_year: 2023,
  season: 'Spring',
  state: 'Paraná',
  area: 200.0,
  production: 8500,
  annual_rainfall: 1100.0,
  fertilizer: 350.5,
  pesticide: 50.0,
  yield: 42.5,
};

export const tableSchema = schema.map(({ name, label, type }) => ({
  key: name,
  label,
  type,
}));

tableSchema.push({ key: 'actions', label: 'Ações', type: 'actions' });
