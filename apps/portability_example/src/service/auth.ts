import { LoginRequest, LoginResponse } from '../schemas/auth';

import { getLocalStorageData, putLocalStorageData } from '../storage';
import { processPOST } from './service';

export const login = async (params: LoginRequest): Promise<string> => {
  const result = await processPOST<LoginRequest, LoginResponse>({
    path: '/client_auth/login',
    body: params,
  });

  if (!result?.token) {
    return '';
  }

  putLocalStorageData({
    token: result.token,
  });
  return result.token;
};

export const logout = async (): Promise<void> => {
  const result = await processPOST({
    path: '/client_auth/logout',
    body: {
      token: getLocalStorageData()?.token,
    },
  });

  if (result) {
    localStorage.removeItem('utoken');
  }
};
