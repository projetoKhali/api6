import { validate } from '../service/AuthService';

export const getTokenFromLocalStorage = (): string | null => {
  const userToken = localStorage.getItem('khali_api6:utoken');
  return userToken ? userToken : null;
};

export const setTokenToLocalStorage = (token: string): void => {
  localStorage.setItem('khali_api6:utoken', token);
};

export const clearLocalStorageData = (): void => {
  localStorage.removeItem('khali_api6:utoken');
};

export const isUserLoggedIn = async (): Promise<boolean> => {
  const token = getTokenFromLocalStorage();

  if (!token) return false;

  return await validate(token);
};
