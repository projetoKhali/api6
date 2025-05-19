import { NewUser, User } from '../src/schemas/UserSchema';
import { Page } from '../src/schemas/pagination';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} from '../src/service/UserService';
import {
    processGET,
    processPaginatedGET,
    processPOST,
    processRequest,
} from '../src/service/service';

jest.mock('../src/service/service');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
});

describe('getUsers', () => {
  it('should call processPaginatedGET with correct params and return result', async () => {
    const mockPage = { items: [], total: 0, page: 1, size: 50 };
    (processPaginatedGET as jest.Mock).mockResolvedValueOnce(mockPage);

    const result = await getUsers(1, 50);

    expect(processPaginatedGET).toHaveBeenCalledWith({ path: `/user/`, page: 1, size: 50 });
    expect(result).toBe(mockPage);
  });
});

describe('getUser', () => {
  it('should call processGET with correct params and return result', async () => {
    const mockUser = { id: '1', name: 'Test User' };
    (processGET as jest.Mock).mockResolvedValueOnce(mockUser);

    const result = await getUser('1');

    expect(processGET).toHaveBeenCalledWith({
      path: `/user/1`,
      overrideURL: expect.anything(),
    });
    expect(result).toBe(mockUser);
  });
});

describe('createUser', () => {
  it('should call processPOST with correct params and return result', async () => {
    const newUser = { name: 'New User', email: 'new@example.com' };
    const createdUser = { id: '2', ...newUser };
    (processPOST as jest.Mock).mockResolvedValueOnce(createdUser);

    const result = await createUser(newUser as any);

    expect(processPOST).toHaveBeenCalledWith({
      path: `/register`,
      body: newUser,
      overrideURL: expect.anything(),
    });
    expect(result).toBe(createdUser);
  });
});

describe('updateUser', () => {
  it('should call processRequest with correct params and return result', async () => {
    const updatedFields = { name: 'Updated Name' };
    const updatedUser = { id: '1', name: 'Updated Name' };
    (processRequest as jest.Mock).mockResolvedValueOnce(updatedUser);

    const result = await updateUser('1', updatedFields);

    expect(processRequest).toHaveBeenCalledWith('PUT', {
      path: `/user/1`,
      body: updatedFields,
      overrideURL: expect.anything(),
    });
    expect(result).toBe(updatedUser);
  });
});

describe('deleteUser', () => {
  it('should call processRequest with DELETE and correct params', async () => {
    (processRequest as jest.Mock).mockResolvedValueOnce(undefined);

    await deleteUser('1');

    expect(processRequest).toHaveBeenCalledWith('DELETE', {
      path: `/user/1`,
      overrideURL: expect.anything(),
    });
  });
});
