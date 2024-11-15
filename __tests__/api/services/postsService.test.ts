import { postsService } from '../../../src/api/services/postsService';
import { Post, PostModel, PostInput } from '../../../src/api/models/postModel';
import { validatePostInput } from '../../../src/utils/validators';
import { sanitizeInput } from '../../../src/utils/helpers';

jest.mock('../../../src/api/models/postModel');

const mockedPostModel = PostModel as jest.Mocked<typeof PostModel>;

describe('PostsService', () => {
    const userId = 'testuser';

    beforeEach(() => {
        jest.clearAllMocks();
        mockedPostModel.mockClear();
        mockedPostModel.mockImplementation(() => ({
            createPost: jest.fn(),
            getPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn()
        }));
    });

    it('should create a new post successfully', async () => {
        const postInput: PostInput = {
            userId: parseInt(userId, 10),
            content: 'This is a test post.',
        };
        const mockPost: Post = {
            id: 1,
            userId: postInput.userId,
            content: sanitizeInput(postInput.content),
            createdAt: new Date()
        };
        mockedPostModel.createPost.mockResolvedValueOnce(mockPost);
        const createdPost = await postsService.createPost(postInput);
        expect(createdPost).toEqual(mockPost);
        expect(mockedPostModel.createPost).toHaveBeenCalledWith(mockPost);
    });

    it('should throw an error if post input is invalid', async () => {
        const invalidPostInput: PostInput = {
            userId: userId,
            content: '',
        };
        await expect(postsService.createPost(invalidPostInput)).rejects.toThrow();
    });

    it('should throw an error if creating a post fails', async () => {
        const postInput: PostInput = {
            userId: parseInt(userId, 10),
            content: 'This is a test post.',
        };
        mockedPostModel.createPost.mockRejectedValueOnce(new Error('Failed to create post'));
        await expect(postsService.createPost(postInput)).rejects.toThrow('Failed to create post');
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
        mockedPostModel.getPosts.mockResolvedValueOnce(mockPosts);
        const posts = await postsService.getPosts(1, 10);
        expect(posts).toEqual(mockPosts);
        expect(mockedPostModel.getPosts).toHaveBeenCalledWith(1, 10);
    });

    it('should return an empty array if no posts are found', async () => {
        mockedPostModel.getPosts.mockResolvedValueOnce([]);
        const posts = await postsService.getPosts(1, 10);
        expect(posts).toEqual([]);
    });


    it('should throw an error if getting posts fails', async () => {
        mockedPostModel.getPosts.mockRejectedValueOnce(new Error('Failed to get posts'));
        await expect(postsService.getPosts(1, 10)).rejects.toThrow('Failed to get posts');
    });

    it('should update an existing post successfully', async () => {
        const postId = '1';
        const updates: Partial<PostInput> = { content: 'Updated post content' };
        const updatedPost: Post = {
            id: 1,
            userId: parseInt(userId, 10),
            content: sanitizeInput(updates.content),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockedPostModel.updatePost.mockResolvedValueOnce(updatedPost);
        const updated = await postsService.updatePost(postId, updates, userId);
        expect(updated).toEqual(updatedPost);
        expect(mockedPostModel.updatePost).toHaveBeenCalledWith(parseInt(postId, 10), updates);
    });

    it('should return null if updating post fails', async () => {
        const postId = 'nonexistent';
        const updates: Partial<PostInput> = { content: 'Updated post content' };
        mockedPostModel.updatePost.mockResolvedValueOnce(null);
        const updatedPost = await postsService.updatePost(postId, updates, userId);
        expect(updatedPost).toBeNull();
    });

    it('should throw an error if update post input is invalid', async () => {
        const postId = '1';
        const updates: Partial<PostInput> = { content: '' };
        await expect(postsService.updatePost(postId, updates, userId)).rejects.toThrow();
    });

    it('should delete a post successfully', async () => {
        const postId = '1';
        mockedPostModel.deletePost.mockResolvedValueOnce(undefined);
        await postsService.deletePost(postId, userId);
        expect(mockedPostModel.deletePost).toHaveBeenCalledWith(parseInt(postId, 10));
    });

    it('should return null if deleting post fails', async () => {
        const postId = 'nonexistent';
        mockedPostModel.deletePost.mockResolvedValueOnce(null);
        await postsService.deletePost(postId, userId);
        expect(mockedPostModel.deletePost).toHaveBeenCalledWith(parseInt(postId, 10));
    });

    it('should throw an error if deleting a post fails', async () => {
        const postId = '1';
        mockedPostModel.deletePost.mockRejectedValueOnce(new Error('Failed to delete post'));
        await expect(postsService.deletePost(postId, userId)).rejects.toThrow('Failed to delete post');
    });

    it('should get a post successfully', async () => {
        const postId = '1';
        const mockPost: Post = {
            id: 1,
            userId: parseInt(userId, 10),
            content: 'Test Post',
            createdAt: new Date()
        };
        mockedPostModel.getPost.mockResolvedValueOnce(mockPost);
        const post = await postsService.getPost(postId);
        expect(post).toEqual(mockPost);
        expect(mockedPostModel.getPost).toHaveBeenCalledWith(parseInt(postId,10));
    });

    it('should return null if post not found', async () => {
        const postId = 'nonexistent';
        mockedPostModel.getPost.mockResolvedValueOnce(null);
        const post = await postsService.getPost(postId);
        expect(post).toBeNull();
    });

    it('should throw an error if getting a post fails', async () => {
        const postId = '1';
        mockedPostModel.getPost.mockRejectedValueOnce(new Error('Failed to get post'));
        await expect(postsService.getPost(postId)).rejects.toThrow('Failed to get post');
    });
});
```