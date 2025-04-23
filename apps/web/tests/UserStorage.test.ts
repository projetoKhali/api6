import {
    getUserFromLocalStorage,
    setUserToLocalStorage,
    clearUserFromLocalStorage,
    isUserLoggedIn,
    } from '../src/store/UserStorage';

import { User } from '../src/schemas/UserSchema';


describe('UserStorage', () => {
const mockUser: User = {
    id: 1,
    name: 'John Doe',
    login: 'johndoe',
    email: 'johndoe@email.com',
    version_terms_agreement: '1.0',
    permission_id: 1,
};

beforeEach(() => {
    localStorage.clear();
});

it('should get a user from localStorage', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    const result = getUserFromLocalStorage();

    expect(result).toEqual(mockUser);
});

it('should return null if no user is in localStorage', () => {
    const result = getUserFromLocalStorage();

    expect(result).toBeNull();
});

it('should set a user to localStorage', () => {
    setUserToLocalStorage(mockUser);

    const storedUser = localStorage.getItem('user');
    expect(storedUser).toEqual(JSON.stringify(mockUser));
});

it('should clear a user from localStorage', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    clearUserFromLocalStorage();

    const storedUser = localStorage.getItem('user');
    expect(storedUser).toBeNull();
});

it('should return true if a user is logged in', () => {
    localStorage.setItem('user', JSON.stringify(mockUser));

    const result = isUserLoggedIn();

    expect(result).toBe(true);
});

it('should return false if no user is logged in', () => {
    const result = isUserLoggedIn();

    expect(result).toBe(false);
});
});