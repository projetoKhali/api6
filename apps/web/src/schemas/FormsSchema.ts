export type FieldType = "text" | "number" | "date" | "select";

export interface FieldSchema {
  type: FieldType;
  label: string;
  name: string;
  options?: string[]; // Apenas para campos select
}

export const schema: FieldSchema[] = [
  { type: "text", label: "Lote", name: "plot" },
  { type: "select", label: "Espécie", name: "species", options: ["Café", "Cacau"] },
  { type: "date", label: "Data", name: "date" },
  { type: "number", label: "Idade", name: "age" },
];

export const initialValues: Record<string, string> = {
  plot: "Lote 1",
  species: "Café",
  date: "2023-10-01",
  age: "10",
};