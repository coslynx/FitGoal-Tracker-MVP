import request from 'supertest';
import { app } from '../../../src/api/index';
import { userModel } from '../../../src/api/models/userModel';
import { authService } from '../../../src/api/services/authService';
import { User } from '../../../src/api/models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const saltRounds = 10;

describe('Auth Controller', () => {
    let user:User;

    beforeAll(async () => {
        const password = 'TestPassword1!';
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user = {
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: hashedPassword
        };
        await userModel.createUser(user);
    });

    afterAll(async () => {
      await userModel.deleteUser(user.email);
    });

    it('should register a new user', async () => {
        const newUser = {
            firstName: 'New',
            lastName: 'User',
            email: 'newuser@example.com',
            password: 'TestPassword1!'
        }
        const response = await request(app).post('/api/auth/register').send(newUser);
        expect(response.status).toBe(201);
        expect(response.body.email).toBe(newUser.email);
        await userModel.deleteUser(newUser.email);
    });

    it('should register a new user with error handling for duplicate email', async () => {
        const response = await request(app).post('/api/auth/register').send(user);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Email already exists');
    });

    it('should login a user', async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: user.email,
            password: 'TestPassword1!'
        });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(user.email);
    });


    it('should return 404 if user not found', async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: 'nonexistentuser@example.com',
            password: 'password'
        });
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('User not found');
    });
    
    it('should return 401 if incorrect password', async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: user.email,
            password: 'wrongpassword'
        });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Incorrect password');
    });

    it('should logout a user', async () => {
        const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET as string);
        const response = await request(app).get('/api/auth/logout').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logout successful');
    });

    it('should reset password', async () => {
        const response = await request(app).post('/api/auth/reset-password').send({ email: user.email });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password reset email sent');
    });
});
```