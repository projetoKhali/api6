import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  clearLocalStorageData,
  isUserLoggedIn,
} from '../src/store/storage';

it('should get a user token from localStorage', () => {
  const mockToken = 'mockToken123';
  localStorage.setItem('utoken', JSON.stringify(mockToken));

  const result = getTokenFromLocalStorage();

  expect(result).toEqual(mockToken);
});

it('should set a user token to localStorage', () => {
  const mockToken = 'mockToken123';
  setTokenToLocalStorage(mockToken);

  const storedToken = localStorage.getItem('utoken');
  expect(storedToken).toEqual(JSON.stringify(mockToken));
});

it('should clear a user token from localStorage', () => {
  const mockToken = 'mockToken123';
  localStorage.setItem('utoken', JSON.stringify(mockToken));

  clearLocalStorageData();

  const storedToken = localStorage.getItem('utoken');
  expect(storedToken).toBeNull();
});

it('should return null if no user token is in localStorage', () => {
  const result = getTokenFromLocalStorage();

  expect(result).toBeNull();
});

it('should return false if no user token is present in localStorage', () => {
  const result = isUserLoggedIn();

  expect(result).toBe(false);
});

it('should return true if a user token is present in localStorage', () => {
  const mockToken = 'mockToken123';
  localStorage.setItem('utoken', JSON.stringify(mockToken));

  const result = isUserLoggedIn();

  expect(result).toBe(true);
});
