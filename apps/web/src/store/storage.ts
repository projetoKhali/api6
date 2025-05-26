import { validate } from '../service/AuthService';

export const getTokenFromLocalStorage = (): string | null => {
  const userToken = localStorage.getItem('khali_api6:token');
  return userToken ? userToken : null;
};

export const setTokenToLocalStorage = (token: string): void => {
  localStorage.setItem('khali_api6:token', token);
};

export const clearLocalStorageData = (): void => {
  localStorage.removeItem('khali_api6:token');
};

export const isUserLoggedIn = async (): Promise<boolean> => {
  const token = getTokenFromLocalStorage();

  if (!token) return false;

  return await validate(token);
};

export const getUserIdFromLocalStorage = (): number => {
  const userId = localStorage.getItem('khali_api6:id');
  return userId ? parseInt(userId) : 0;
};

export const setUserIdToLocalStorage = (userId: string): void => {
  localStorage.setItem('khali_api6:id', userId);
};

export const clearUserIdFromLocalStorage = (): void => {
  localStorage.removeItem('khali_api6:id');
};

export const setPermissionsToLocalStorage = (permissions: string[]): void => {
  localStorage.setItem('khali_api6:permissions', JSON.stringify(permissions));
};
