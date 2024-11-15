import express, { Request, Response, Router } from 'express';
import postsController from '../controllers/postsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.post('/posts', authMiddleware, postsController.createPost);

router.get('/posts', authMiddleware, postsController.getPosts);

router.put('/posts/:id', authMiddleware, postsController.updatePost);

router.delete('/posts/:id', authMiddleware, postsController.deletePost);

export default router;

```