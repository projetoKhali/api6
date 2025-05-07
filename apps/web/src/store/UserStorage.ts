export const getUserFromLocalStorage = (): string | null => {
  const userToken = localStorage.getItem('khali_api6:utoken');
  return userToken ? userToken : null;
};

export const setUserToLocalStorage = (token: string): void => {
  localStorage.setItem('khali_api6:utoken', token);
};

export const clearUserFromLocalStorage = (): void => {
  localStorage.removeItem('khali_api6:utoken');
};

export const isUserLoggedIn = (): boolean => {
  const user = getUserFromLocalStorage();
  return user !== null;
};
