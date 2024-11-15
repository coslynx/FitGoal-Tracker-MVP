import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel';
import { User } from '../models/userModel';
import { Request, Response } from 'express';
import { validateRegisterInput, validateLoginInput } from '../utils/validators';


class AuthService {
    async registerUser(userData: User): Promise<User> {
        const { errors, isValid } = validateRegisterInput(userData);
        if (!isValid) {
            throw new Error(JSON.stringify(errors));
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        const newUser = new UserModel({ ...userData, password: hashedPassword });
        const savedUser = await newUser.save();
        return savedUser;
    }

    async loginUser(credentials: { email: string; password: string; }): Promise<{ token: string; user: User } | null> {
        const { errors, isValid } = validateLoginInput(credentials);
        if (!isValid) {
            throw new Error(JSON.stringify(errors));
        }
        const user = await UserModel.findOne({ email: credentials.email });
        if (!user) {
            return null;
        }
        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
            return null;
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
        return { token, user };
    }

    async logoutUser(userId: string):Promise<boolean>{
        //In a real application, you would invalidate tokens here.  For the MVP, we'll just return true for simplicity
        return true;
    }
}

export const authService = new AuthService();

```