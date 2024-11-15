import request from 'supertest';
import { app } from '../../../src/api/index';
import { postsService } from '../../../src/api/services/postsService';
import { Post, PostInput } from '../../../src/api/models/postModel';
import { validatePostInput } from '../../../src/utils/validators';

jest.mock('../../../src/api/services/postsService');

const mockedPostsService = postsService as jest.Mocked<typeof postsService>;

describe('Posts Controller', () => {
    const userId = 'testuser';

    const validPostInput: PostInput = {
        userId: userId,
        content: 'This is a test post.'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new post', async () => {
        const mockPost: Post = {
            id: 1,
            userId: parseInt(userId, 10),
            content: validPostInput.content,
            createdAt: new Date()
        };
        mockedPostsService.createPost.mockResolvedValueOnce(mockPost);
        const response = await request(app).post('/api/posts').send(validPostInput);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockPost);
        expect(mockedPostsService.createPost).toHaveBeenCalledWith({ ...validPostInput, userId: parseInt(userId, 10) });
    });

    it('should return 400 if post input is invalid', async () => {
        const invalidPostInput: PostInput = {
            userId: userId,
            content: ''
        };
        const response = await request(app).post('/api/posts').send(invalidPostInput);
        expect(response.status).toBe(400);
        expect(response.body).toEqual(validatePostInput(invalidPostInput).errors);
    });

    it('should return 500 if creating post fails', async () => {
        mockedPostsService.createPost.mockRejectedValueOnce(new Error('Failed to create post'));
        const response = await request(app).post('/api/posts').send(validPostInput);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to create post');
    });

    it('should get posts with pagination', async () => {
        const mockPosts: Post[] = [
            {
                id: 1,
                userId: parseInt(userId, 10),
                content: 'Post 1',
                createdAt: new Date()
            },
            {
                id: 2,
                userId: parseInt(userId, 10),
                content: 'Post 2',
                createdAt: new Date()
            }
        ];
        mockedPostsService.getPosts.mockResolvedValueOnce(mockPosts);
        const response = await request(app).get('/api/posts?page=1&limit=10').set('Authorization', 'Bearer token');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockPosts);
        expect(mockedPostsService.getPosts).toHaveBeenCalledWith(1,10);
    });

    it('should return 500 if getting posts fails', async () => {
        mockedPostsService.getPosts.mockRejectedValueOnce(new Error('Failed to get posts'));
        const response = await request(app).get('/api/posts').set('Authorization', 'Bearer token');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to retrieve posts');
    });


    it('should update an existing post', async () => {
        const postId = '1';
        const updates: Partial<PostInput> = { content: 'Updated post content' };
        const updatedPost: Post = {
            id: parseInt(postId, 10),
            userId: parseInt(userId, 10),
            content: updates.content,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockedPostsService.updatePost.mockResolvedValueOnce(updatedPost);
        const response = await request(app).put(`/api/posts/${postId}`).send(updates).set('Authorization', 'Bearer token');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedPost);
        expect(mockedPostsService.updatePost).toHaveBeenCalledWith(postId, updates, userId);
    });

    it('should return 404 if updating post fails', async () => {
        const postId = 'nonexistent';
        const updates: Partial<PostInput> = { content: 'Updated post content' };
        mockedPostsService.updatePost.mockResolvedValueOnce(null);
        const response = await request(app).put(`/api/posts/${postId}`).send(updates).set('Authorization', 'Bearer token');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Post not found or unauthorized');
    });

    it('should return 400 if update post input is invalid', async () => {
        const postId = '1';
        const updates: Partial<PostInput> = { content: '' };
        const response = await request(app).put(`/api/posts/${postId}`).send(updates).set('Authorization', 'Bearer token');
        expect(response.status).toBe(400);
        expect(response.body).toEqual(validatePostInput(updates).errors);
    });

    it('should delete a post', async () => {
        const postId = '1';
        mockedPostsService.deletePost.mockResolvedValueOnce(undefined);
        const response = await request(app).delete(`/api/posts/${postId}`).set('Authorization', 'Bearer token');
        expect(response.status).toBe(204);
        expect(mockedPostsService.deletePost).toHaveBeenCalledWith(postId, userId);
    });

    it('should return 500 if deleting post fails', async () => {
        const postId = '1';
        mockedPostsService.deletePost.mockRejectedValueOnce(new Error('Failed to delete post'));
        const response = await request(app).delete(`/api/posts/${postId}`).set('Authorization', 'Bearer token');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to delete post');
    });

    it('should return 404 if post not found', async () => {
        const postId = 'nonexistent';
        mockedPostsService.deletePost.mockResolvedValueOnce(undefined);
        const response = await request(app).delete(`/api/posts/${postId}`).set('Authorization', 'Bearer token');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Post not found or unauthorized');
    });

});
```