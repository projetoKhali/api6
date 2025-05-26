import { validate } from '../src/service/AuthService';
import {
  getLocalStorageData,
  clearLocalStorageData,
  isUserLoggedIn,
  setLocalStorageData,
} from '../src/store/storage';

jest.mock('../src/service/AuthService', () => ({
  validate: jest.fn(),
}));

describe('storage', () => {
  const localStorageDataKey = 'khali_api6:user';

  const testLocalStorageDataObject = {
    id: 1,
    token: 'xyz789',
    permissions: [],
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getTokenFromLocalStorage', () => {
    it('returns token if present', () => {
      localStorage.setItem(
        localStorageDataKey,
        JSON.stringify(testLocalStorageDataObject)
      );
      expect(getLocalStorageData()).toMatchObject(testLocalStorageDataObject);
    });

    it('returns null if data not present', () => {
      expect(getLocalStorageData()).toBeNull();
    });
  });

  describe('setLocalStorageData', () => {
    it('sets data in localStorage', () => {
      setLocalStorageData(testLocalStorageDataObject);
      expect(localStorage.getItem(localStorageDataKey)).toMatchObject(
        testLocalStorageDataObject
      );
    });
  });

  describe('clearLocalStorageData', () => {
    it('removes token from localStorage', () => {
      localStorage.setItem(localStorageDataKey, 'abc123');
      clearLocalStorageData();
      expect(localStorage.getItem(localStorageDataKey)).toBeNull();
    });
  });

  describe('isUserLoggedIn', () => {
    it('returns false if no token', async () => {
      expect(await isUserLoggedIn()).toBe(false);
      expect(validate).not.toHaveBeenCalled();
    });

    it('calls validate and returns its result if token exists', async () => {
      localStorage.setItem(
        localStorageDataKey,
        JSON.stringify(testLocalStorageDataObject)
      );
      (validate as jest.Mock).mockResolvedValue(true);
      expect(await isUserLoggedIn()).toBe(true);
      expect(validate).toHaveBeenCalledWith('xyz789');
    });

    it('returns false if validate returns false', async () => {
      localStorage.setItem(
        localStorageDataKey,
        JSON.stringify(testLocalStorageDataObject)
      );
      (validate as jest.Mock).mockResolvedValue(false);
      expect(await isUserLoggedIn()).toBe(false);
    });
  });
});
