import express, { Request, Response } from 'express';
import { postsService } from '../services/postsService';
import { Post } from '../models/postModel';
import { validatePostInput } from '../utils/validators';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/posts', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { errors, isValid } = validatePostInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const newPost: Post = await postsService.createPost({ ...req.body, userId: req.user!.id });
        return res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ error: 'Failed to create post' });
    }
});

router.get('/posts', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const posts: Post[] = await postsService.getPosts(parseInt(page as string, 10), parseInt(limit as string, 10));
        return res.json(posts);
    } catch (error) {
        console.error('Error retrieving posts:', error);
        return res.status(500).json({ error: 'Failed to retrieve posts' });
    }
});

router.put('/posts/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { errors, isValid } = validatePostInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const updatedPost: Post | null = await postsService.updatePost(req.params.id, req.body, req.user!.id);
        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found or unauthorized' });
        }
        return res.json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ error: 'Failed to update post' });
    }
});

router.delete('/posts/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        await postsService.deletePost(req.params.id, req.user!.id);
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ error: 'Failed to delete post' });
    }
});

export default router;
```