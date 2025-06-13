export type StorageData = {
  token: string;
  portabilityToken: string;
};

export const setLocalStorageData = (userData: StorageData): void => {
  localStorage.setItem(
    'khali_api6_portability_example:user',
    JSON.stringify(userData)
  );
};

export const getLocalStorageData = (): StorageData | null => {
  const userData = localStorage.getItem('khali_api6_portability_example:user');
  return userData ? JSON.parse(userData) : null;
};

export const putLocalStorageData = (userData: Partial<StorageData>): void => {
  const currentData = getLocalStorageData();
  if (currentData) {
    const updatedData = { ...currentData, ...userData };
    setLocalStorageData(updatedData);
  }
};

export const clearLocalStorageData = (): void => {
  localStorage.removeItem('khali_api6_portability_example:user');
};
