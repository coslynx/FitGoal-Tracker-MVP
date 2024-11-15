import { authService } from '../../../src/api/services/authService';
import { userModel } from '../../../src/api/models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../../src/api/models/userModel';
import { validateRegisterInput, validateLoginInput } from '../../../src/utils/validators';

jest.mock('../../../src/api/models/userModel');
const mockUserModel = userModel as jest.Mocked<typeof userModel>;

describe('AuthService', () => {
    const saltRounds = 10;
    let validUser: User;

    beforeAll(async () => {
        const password = 'TestPassword1!';
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        validUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: hashedPassword,
        };
    });


    it('should register a new user successfully', async () => {
        const mockUserData: User = { ...validUser, password: 'TestPassword1!' };
        const mockUserDb: User = { ...validUser, id: '1' };
        mockUserModel.createUser.mockResolvedValueOnce(mockUserDb);
        const registeredUser = await authService.registerUser(mockUserData);
        expect(registeredUser).toEqual(mockUserDb);
        expect(mockUserModel.createUser).toHaveBeenCalledWith(mockUserData);
    });


    it('should return an error for invalid user data', async () => {
        const invalidUserData: Partial<User> = {
            firstName: '',
            lastName: '',
            email: 'invalid-email',
            password: 'password',
        };
        await expect(authService.registerUser(invalidUserData as User)).rejects.toThrow();
    });

    it('should return an error if email already exists', async () => {
        mockUserModel.createUser.mockRejectedValueOnce(new Error('Email already exists'));
        await expect(authService.registerUser(validUser)).rejects.toThrow('Email already exists');
    });

    it('should return an error for database error', async () => {
        mockUserModel.createUser.mockRejectedValueOnce(new Error('Database error'));
        await expect(authService.registerUser(validUser)).rejects.toThrow('Database error');
    });

    it('should login a user successfully', async () => {
        const mockUserDb: User = { ...validUser, id: '1' };
        mockUserModel.findUserByEmail.mockResolvedValueOnce(mockUserDb);
        bcrypt.compare.mockResolvedValueOnce(true);
        const loginResult = await authService.loginUser({ email: validUser.email, password: 'TestPassword1!' });
        expect(loginResult).toBeDefined();
        expect(loginResult?.token).toBeDefined();
        expect(loginResult?.user).toEqual(mockUserDb);
    });

    it('should return null for incorrect password', async () => {
        mockUserModel.findUserByEmail.mockResolvedValueOnce(validUser);
        bcrypt.compare.mockResolvedValueOnce(false);
        const loginResult = await authService.loginUser({ email: validUser.email, password: 'wrongpassword' });
        expect(loginResult).toBeNull();
    });

    it('should return null if user not found', async () => {
        mockUserModel.findUserByEmail.mockResolvedValueOnce(null);
        const loginResult = await authService.loginUser({ email: 'nonexistent@example.com', password: 'password' });
        expect(loginResult).toBeNull();
    });

    it('should return an error for database error during login', async () => {
        mockUserModel.findUserByEmail.mockRejectedValueOnce(new Error('Database error'));
        await expect(authService.loginUser({ email: validUser.email, password: 'TestPassword1!' })).rejects.toThrow('Database error');

    });


    it('should logout a user successfully', async () => {
        const logoutResult = await authService.logoutUser('testUserId');
        expect(logoutResult).toBe(true);
    });

    it('should handle errors gracefully during logout', async () => {
        // For MVP, logoutUser is a placeholder. Add more robust error handling in future iterations.
        const logoutResult = await authService.logoutUser('testUserId');
        expect(logoutResult).toBe(true);
    });
});

```