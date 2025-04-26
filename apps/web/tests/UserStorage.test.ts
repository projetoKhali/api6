import {
    getUserFromLocalStorage,
    setUserToLocalStorage,
    clearUserFromLocalStorage,
    isUserLoggedIn,
} from '../src/store/UserStorage';



it('should get a user token from localStorage', () => {
    const mockToken = 'mockToken123';
    localStorage.setItem('utoken', JSON.stringify(mockToken));

    const result = getUserFromLocalStorage();

    expect(result).toEqual(mockToken);
});

it('should set a user token to localStorage', () => {
    const mockToken = 'mockToken123';
    setUserToLocalStorage(mockToken);

    const storedToken = localStorage.getItem('utoken');
    expect(storedToken).toEqual(JSON.stringify(mockToken));
});

it('should clear a user token from localStorage', () => {
    const mockToken = 'mockToken123';
    localStorage.setItem('utoken', JSON.stringify(mockToken));

    clearUserFromLocalStorage();

    const storedToken = localStorage.getItem('utoken');
    expect(storedToken).toBeNull();
});

it('should return null if no user token is in localStorage', () => {
    const result = getUserFromLocalStorage();

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