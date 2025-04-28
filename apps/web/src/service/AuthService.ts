import {
  getUserFromLocalStorage,
  setUserToLocalStorage,
} from '../store/UserStorage';
import { AUTH_BASE_URL, processPOST } from './service';

type LoginRequest = {
  username: string;
  password: string;
};

type LoginResponse = {
  token?: string;
};

export const login = async (
  username: string,
  password: string
): Promise<boolean> => {
  const result = await processPOST<LoginRequest, LoginResponse>(
    '/login',
    { username, password },
    AUTH_BASE_URL
  );

  if (!result.token) {
    return false;
  }

  setUserToLocalStorage(result.token);
  return true;
};

export const logout = async (): Promise<void> => {
  const result = await processPOST(
    '/logout',
    {
      token: getUserFromLocalStorage(),
    },
    AUTH_BASE_URL
  );

  if (result) {
    localStorage.removeItem('utoken');
  }
};
