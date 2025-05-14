export type LoginRequest = {
  login: string;
  password: string;
};

export type LoginResponse = {
  token?: string;
};

export type ValidateRequest = {
  token: string;
};

export type ValidateResponse = {
  token: string;
};
