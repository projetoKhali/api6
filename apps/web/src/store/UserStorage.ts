export const getUserFromLocalStorage = (): string | null => {
  const userToken = localStorage.getItem('utoken');
  if (userToken) {
    return JSON.parse(userToken);
  }
  return null;
};

export const setUserToLocalStorage = (token: string): void => {
  localStorage.setItem('utoken', JSON.stringify(token));
};

export const clearUserFromLocalStorage = (): void => {
  localStorage.removeItem('utoken');
};

export const isUserLoggedIn = (): boolean => {
  const user = getUserFromLocalStorage();
  return user !== null;
};
