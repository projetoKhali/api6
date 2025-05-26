export type LoginRequest = {
  login: string;
  password: string;
};

export type LoginResponse = {
  user?: {
    id: number;
    token: string;
    permissions: string[];
  };
};

export type ValidateRequest = {
  token: string;
};

export type ValidateResponse = boolean;
