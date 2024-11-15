import { Pool } from 'pg';

interface Post {
    id?: number;
    userId: number;
    content: string;
    createdAt: Date;
    updatedAt?: Date;
}

export class PostModel {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    }

    async createPost(post: Partial<Post>): Promise<Post> {
        try {
            const { userId, content } = post;
            const { rows } = await this.pool.query<Post>(
                'INSERT INTO posts (user_id, content, created_at) VALUES ($1, $2, NOW()) RETURNING *',
                [userId, content]
            );
            return rows[0];
        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error('Failed to create post');
        }
    }

    async getPost(id: number): Promise<Post | null> {
        try {
            const { rows } = await this.pool.query<Post>('SELECT * FROM posts WHERE id = $1', [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error retrieving post:', error);
            throw new Error('Failed to retrieve post');
        }
    }

    async updatePost(id: number, updates: Partial<Post>): Promise<Post | null> {
        try {
            const { content } = updates;
            const { rows } = await this.pool.query<Post>(
                'UPDATE posts SET content = COALESCE($1, content), updated_at = NOW() WHERE id = $2 RETURNING *',
                [content, id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error updating post:', error);
            throw new Error('Failed to update post');
        }
    }

    async deletePost(id: number): Promise<void> {
        try {
            await this.pool.query('DELETE FROM posts WHERE id = $1', [id]);
        } catch (error) {
            console.error('Error deleting post:', error);
            throw new Error('Failed to delete post');
        }
    }
}

export const postModel = new PostModel();
```