// schemas/CustomPredictionSchema.ts

export interface CustomPredictionRequest {
    state?: string;
    crop?: string;
    area?: number;
    fertilizer?: number;
    pesticide?: number;
    annual_rainfall?: number;
    year?: number;
    season?: string;
  }
  
  export interface CustomPredictionResponse {
    State: string;
    Crop: string;
    Area: number;
    Annual_Rainfall: number;
    Year: number;
    Season: string;
    Predicted_Fertilizer: number;
    Predicted_Pesticide: number;
    Predicted_Production: number;
  }
  