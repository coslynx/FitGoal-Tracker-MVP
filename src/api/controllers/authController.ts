import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from '../services/authService';
import { userModel } from '../models/userModel';
import { validateRegisterInput, validateLoginInput } from '../utils/validators';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { errors, isValid } = validateRegisterInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const user = await authService.registerUser(req.body);
        return res.status(201).json(user);
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ error: 'Failed to register user' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { errors, isValid } = validateLoginInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);
        return res.json({ token, user });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ error: 'Failed to log in' });
    }
});


router.get('/logout', (req: Request, res: Response) => {
    try {
        //Implementation for logout,  JWT based or session based depending on implementation
        return res.status(200).json({message: "Logout successful"});
    } catch (error) {
        console.error("Error logging out user:", error);
        return res.status(500).json({ error: 'Failed to log out' });
    }
});

router.post('/reset-password', async (req:Request, res:Response) => {
    try {
        const {email} = req.body;
        //Implementation for password reset, requires email service integration
        return res.status(200).json({message: "Password reset email sent"});
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ error: 'Failed to reset password' });
    }
});


export default router;

```