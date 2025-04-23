import { User } from "../schemas/UserSchema";

let userCache: User | null = null;

export const getUserFromLocalStorage = (): User | null => {
    const userString = localStorage.getItem("user");
    if (userString) {
        return JSON.parse(userString);
    }
    return null;
};

export const setUserToLocalStorage = (user: User): void => {
    const safeUser =
        localStorage.setItem("user", JSON.stringify(user));
    userCache = user;
};

export const clearUserFromLocalStorage = (): void => {
    localStorage.removeItem("user");
    userCache = null;
};

export const isUserLoggedIn = (): boolean => {
    const user = getUserFromLocalStorage();
    return user !== null;
};