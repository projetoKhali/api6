import {
  AUTH_BASE_URL,
  processGET,
  processPaginatedGET,
  processPOST,
  processRequest,
} from './service';
import { NewUser, User } from '../schemas/UserSchema';
import { Page } from '../schemas/pagination';

export const getUsers = async (
  page: number,
  size = 50
): Promise<Page<User>> => {
  return await processPaginatedGET({
    path: `/users/`,
    page,
    size,
    overrideURL: AUTH_BASE_URL,
  });
};

export const getUser = async (id: number): Promise<User> => {
  return await processGET<User>({
    path: `/user/${id}`,
    overrideURL: AUTH_BASE_URL,
  });
};

export const createUser = async (newUser: NewUser): Promise<User> => {
  return await processPOST<NewUser, User>({
    path: `/register/`,
    body: newUser,
    overrideURL: AUTH_BASE_URL,
  });
};

export const updateUser = async (
  id: number,
  updatedFields: Partial<User>
): Promise<User> => {
  return await processRequest<Partial<User>, User>('PUT', {
    path: `/user/${id}`,
    body: updatedFields,
    overrideURL: AUTH_BASE_URL,
  });
};

export const deleteUser = async (id: number): Promise<void> => {
  return await processRequest<never, void>('DELETE', {
    path: `/user/${id}`,
    overrideURL: AUTH_BASE_URL,
  });
};
