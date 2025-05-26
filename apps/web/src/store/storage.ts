import { validate } from '../service/AuthService';

export type UserData = {
  token: string;
  id: number;
  permissions: string[];
};

export const setLocalStorageData = (userData: UserData): void => {
  localStorage.setItem('khali_api6:user', JSON.stringify(userData));
};

export const getLocalStorageData = (): UserData | null => {
  const userData = localStorage.getItem('khali_api6:user');
  return userData ? JSON.parse(userData) : null;
};

export const putLocalStorageData = (userData: Partial<UserData>): void => {
  const currentData = getLocalStorageData();
  if (currentData) {
    const updatedData = { ...currentData, ...userData };
    setLocalStorageData(updatedData);
  }
};

export const clearLocalStorageData = (): void => {
  localStorage.removeItem('khali_api6:user');
};
export const isUserLoggedIn = async (): Promise<boolean> => {
  const user = getLocalStorageData();

  if (!user?.token) return false;

  return await validate(user.token);
};
