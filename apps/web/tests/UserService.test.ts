import { NewUser, User } from '../src/schemas/UserSchema';
import { Page } from '../src/schemas/pagination';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
} from '../src/service/UserService';
import {
    processGET,
    processPaginatedGET,
    processPOST,
    processRequest,
} from '../src/service/service';

jest.mock('../src/service/service');

describe('UserService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch paginated users', async () => {
        const mockPage: Page<User> = {
            items: [{
                id: 1,
                name: 'John Doe',
                login: 'johndoe',
                email: 'johndoe@email.com',
                version_terms_agreement: '1.0',
                permission_id: 1
            }],
            totalPages: 1,
            totalItems: 1,
            size: 50
        };
        (processPaginatedGET as jest.Mock).mockResolvedValue(mockPage);

        const result = await getUsers(1, 50);

        expect(processPaginatedGET).toHaveBeenCalledWith('/user/', 1, 50);
        expect(result).toEqual(mockPage);
    });

    it('should fetch a user by ID', async () => {
        const mockUser: User = {
            id: 1,
            name: 'John Doe',
            login: 'johndoe',
            email: 'johndoe@email.com',
            version_terms_agreement: '1.0',
            permission_id: 1
        };
        (processGET as jest.Mock).mockResolvedValue(mockUser);

        const result = await getUser('1');

        expect(processGET).toHaveBeenCalledWith('/user/1');
        expect(result).toEqual(mockUser);
    });

    it('should create a new user', async () => {
        const newUser: NewUser = {
            id: 1,
            name: 'John Doe',
            login: 'johndoe',
            password: 'password123',
            email: 'johndoe@email.com',
            version_terms_agreement: '1.0',
            permission_id: 1
        };
        const createdUser: User = {
            id: 1,
            name: 'John Doe',
            login: 'johndoe',
            email: 'johndoe@email.com',
            version_terms_agreement: '1.0',
            permission_id: 1
        };
        (processPOST as jest.Mock).mockResolvedValue(createdUser);

        const result = await createUser(newUser);

        expect(processPOST).toHaveBeenCalledWith('/user/create', newUser);
        expect(result).toEqual(createdUser);
    });

    it('should update a user', async () => {
        const updatedFields: Partial<User> = { name: 'John Smith' };
        const updatedUser: User = {
            id: 1,
            name: 'John Doe',
            login: 'johndoe',
            email: 'johndoe@email.com',
            version_terms_agreement: '1.0',
            permission_id: 1
        };
        (processRequest as jest.Mock).mockResolvedValue(updatedUser);

        const result = await updateUser('1', updatedFields);

        expect(processRequest).toHaveBeenCalledWith('PUT', '/user/1', updatedFields);
        expect(result).toEqual(updatedUser);
    });
});
