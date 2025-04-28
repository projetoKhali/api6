import {
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
  return await processPaginatedGET(`/user/`, page, size);
};

export const getUser = async (id: string): Promise<User> => {
  return await processGET<User>(`/user/${id}`);
};

export const createUser = async (data: NewUser): Promise<User> => {
  return await processPOST<NewUser, User>(`/user/create`, data);
};

export const updateUser = async (
  id: string,
  updatedFields: Partial<User>
): Promise<User> => {
  return await processRequest<Partial<User>, User>(
    'PUT',
    `/user/${id}`,
    updatedFields
  );
};

export const deleteUser = async (id: string): Promise<void> => {
  return await processRequest<void, void>('DELETE', `/user/${id}`);
};
