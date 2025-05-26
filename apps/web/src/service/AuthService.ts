import {
  LoginRequest,
  LoginResponse,
  ValidateRequest,
  ValidateResponse,
} from '../schemas/auth';

import { getLocalStorageData, setLocalStorageData } from '../store/storage';
import { AUTH_BASE_URL, processPOST } from './service';

export const login = async (params: LoginRequest): Promise<boolean> => {
  const result = await processPOST<LoginRequest, LoginResponse>({
    path: '/auth/login',
    body: params,
    overrideURL: AUTH_BASE_URL,
  });

  if (!result.user) {
    return false;
  }

  setLocalStorageData(result.user);
  return true;
};

export const validate = async (token: string) => {
  return await processPOST<ValidateRequest, ValidateResponse>({
    path: '/auth/validate',
    body: { token },
    overrideURL: AUTH_BASE_URL,
  }).catch(() => false);
};

export const logout = async (): Promise<void> => {
  const result = await processPOST({
    path: '/auth/logout',
    body: {
      token: getLocalStorageData()?.token,
    },
    overrideURL: AUTH_BASE_URL,
  });

  if (result) {
    localStorage.removeItem('utoken');
  }
};
