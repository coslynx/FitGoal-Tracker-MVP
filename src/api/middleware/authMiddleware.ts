import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authService } from '../services/authService';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authorization token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        const user = await authService.findUserById(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        (req as any).user = user;
        next();

    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error("Authentication middleware error:", error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

```