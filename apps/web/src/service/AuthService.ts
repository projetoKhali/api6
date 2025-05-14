import {
  LoginRequest,
  LoginResponse,
  ValidateRequest,
  ValidateResponse,
} from '../schemas/auth';

import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
} from '../store/storage';
import { AUTH_BASE_URL, processPOST } from './service';

export const login = async (
  login: string,
  password: string
): Promise<boolean> => {
  const result = await processPOST<LoginRequest, LoginResponse>(
    '/',
    { login, password },
    AUTH_BASE_URL
  );

  if (!result.token) {
    return false;
  }

  setTokenToLocalStorage(result.token);
  return true;
};

export const validate = async (token: string) => {
  return await processPOST<ValidateRequest, boolean>(
    '/validate',
    { token },
    AUTH_BASE_URL
  ).catch(() => false);
};

export const logout = async (): Promise<void> => {
  const result = await processPOST(
    '/logout',
    {
      token: getTokenFromLocalStorage(),
    },
    AUTH_BASE_URL
  );

  if (result) {
    localStorage.removeItem('utoken');
  }
};
