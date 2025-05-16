import { validate } from '../src/service/AuthService';
import {
    getTokenFromLocalStorage,
    setTokenToLocalStorage,
    clearLocalStorageData,
    isUserLoggedIn,
    getUserIdFromLocalStorage,
    setUserIdToLocalStorage,
    clearUserIdFromLocalStorage,
} from '../src/store/storage';

jest.mock('../src/service/AuthService', () => ({
validate: jest.fn(),
}));

describe('storage', () => {
const tokenKey = 'khali_api6:utoken';
const userIdKey = 'khali_api6:uid';

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('getTokenFromLocalStorage', () => {
  it('returns token if present', () => {
    localStorage.setItem(tokenKey, 'abc123');
    expect(getTokenFromLocalStorage()).toBe('abc123');
  });

  it('returns null if token not present', () => {
    expect(getTokenFromLocalStorage()).toBeNull();
  });
});

describe('setTokenToLocalStorage', () => {
  it('sets token in localStorage', () => {
    setTokenToLocalStorage('xyz789');
    expect(localStorage.getItem(tokenKey)).toBe('xyz789');
  });
});

describe('clearLocalStorageData', () => {
  it('removes token from localStorage', () => {
    localStorage.setItem(tokenKey, 'abc123');
    clearLocalStorageData();
    expect(localStorage.getItem(tokenKey)).toBeNull();
  });
});

describe('isUserLoggedIn', () => {
  it('returns false if no token', async () => {
    (validate as jest.Mock).mockResolvedValue(true);
    expect(await isUserLoggedIn()).toBe(false);
    expect(validate).not.toHaveBeenCalled();
  });

  it('calls validate and returns its result if token exists', async () => {
    localStorage.setItem(tokenKey, 'abc123');
    (validate as jest.Mock).mockResolvedValue(true);
    expect(await isUserLoggedIn()).toBe(true);
    expect(validate).toHaveBeenCalledWith('abc123');
  });

  it('returns false if validate returns false', async () => {
    localStorage.setItem(tokenKey, 'abc123');
    (validate as jest.Mock).mockResolvedValue(false);
    expect(await isUserLoggedIn()).toBe(false);
  });
});

describe('getUserIdFromLocalStorage', () => {
    it('returns empty string if userId not present', () => {
        expect(getUserIdFromLocalStorage()).toBe('');
    });

    it('returns userId if present', () => {
      localStorage.setItem(userIdKey, '42');
      expect(getUserIdFromLocalStorage()).toBe('42');
    });
});

describe('setUserIdToLocalStorage', () => {
  it('sets userId in localStorage', () => {
    setUserIdToLocalStorage('1');
    expect(localStorage.getItem(userIdKey)).toBe('1');
  });
});

describe('clearUserIdFromLocalStorage', () => {
  it('removes userId from localStorage', () => {
    localStorage.setItem(userIdKey, '42');
    clearUserIdFromLocalStorage();
    expect(localStorage.getItem(userIdKey)).toBeNull();
  });
});
});