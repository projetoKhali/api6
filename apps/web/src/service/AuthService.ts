import {
  LoginRequest,
  LoginResponse,
  ValidateRequest,
  ValidateResponse,
} from '../schemas/auth';

import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  setUserIdToLocalStorage
} from '../store/storage';
import { AUTH_BASE_URL, processPOST } from './service';
import { jwtDecode } from "jwt-decode";

export const login = async (params: LoginRequest): Promise<boolean> => {
  const result = await processPOST<LoginRequest, LoginResponse>({
    path: '/',
    body: params,
    overrideURL: AUTH_BASE_URL,
  });

  if (!result.token) {
    return false;
  }

  setTokenToLocalStorage(result.token);
  
  try{
    const decoded: any = jwtDecode(result.token);
    const userId = decoded.sub;
    if (userId) {
      setUserIdToLocalStorage(userId);
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
  return true;
};

export const validate = async (token: string) => {
  return await processPOST<ValidateRequest, ValidateResponse>({
    path: '/validate',
    body: { token },
    overrideURL: AUTH_BASE_URL,
  }).catch(() => false);
};

export const logout = async (): Promise<void> => {
  const result = await processPOST({
    path: '/logout',
    body: {
      token: getTokenFromLocalStorage(),
    },
    overrideURL: AUTH_BASE_URL,
  });

  if (result) {
    localStorage.removeItem('utoken');
  }
};