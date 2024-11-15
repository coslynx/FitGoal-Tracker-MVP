import { Post, PostModel } from '../models/postModel';
import { PostInput, validatePostInput } from '../../utils/validators';
import { Types } from 'mongoose';

class PostsService {
    async createPost(postInput: PostInput, userId: string): Promise<Post> {
        const { errors, isValid } = validatePostInput(postInput);
        if (!isValid) {
            throw new Error(JSON.stringify(errors));
        }
        const newPost = await PostModel.create({ ...postInput, userId });
        return newPost;
    }

    async getPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
        const skip = (page - 1) * limit;
        const posts = await PostModel.find({}, null, { skip, limit, sort: { createdAt: -1 } });
        return posts;
    }

    async updatePost(postId: string, updates: Partial<PostInput>, userId: string): Promise<Post | null> {
        const post = await PostModel.findById(postId);
        if (!post || post.userId !== userId) {
            return null;
        }
        const { errors, isValid } = validatePostInput(updates);
        if (!isValid) {
            throw new Error(JSON.stringify(errors));
        }
        const updatedPost = await PostModel.findByIdAndUpdate(postId, updates, { new: true });
        return updatedPost;
    }

    async deletePost(postId: string, userId: string): Promise<void> {
        const post = await PostModel.findById(postId);
        if (!post || post.userId !== userId) {
            return;
        }
        await PostModel.findByIdAndDelete(postId);
    }

    async getPost(postId: string): Promise<Post | null> {
        const post = await PostModel.findById(postId);
        return post;
    }


}

export const postsService = new PostsService();

```