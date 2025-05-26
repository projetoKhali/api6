export type LoginRequest = {
  login: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
  userId: number;
  permissions: string[];
};

export type ValidateRequest = {
  token: string;
};

export type ValidateResponse = boolean;
