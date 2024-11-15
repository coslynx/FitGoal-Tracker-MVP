import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from './useAuth';
import { Post } from '@api/models/postModel';

interface UsePostsResponse {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  getPosts: (page: number, limit: number) => Promise<void>;
  createPost: (postContent: string) => Promise<Post | null>;
  updatePost: (postId: string, updates: Partial<Post>) => Promise<Post | null>;
  deletePost: (postId: string) => Promise<void>;
}

const usePosts = (page: number = 1, limit: number = 10): UsePostsResponse => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [totalCount, setTotalCount] = useState(0);

  const getPosts = useCallback(async (page: number = 1, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiService.get<Post[]>(`/api/posts?page=${page}&limit=${limit}`);
      if (response.error) {
        throw new Error(response.error);
      }
      setPosts(response.data);
      setCurrentPage(page);
      setPageSize(limit);
      setTotalCount(response.data.length); 
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, apiService]);

  const createPost = useCallback(async (postContent: string): Promise<Post | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiService.post<Partial<Post>, Post>('/api/posts', { content: postContent, userId: (useAuth().currentUser as User).id });
      if (response.error) {
        throw new Error(response.error);
      }
      setPosts([response.data, ...posts]);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, posts]);

  const updatePost = useCallback(async (postId: string, updates: Partial<Post>): Promise<Post | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiService.put<Partial<Post>, Post>(`/api/posts/${postId}`, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      const updatedPosts = posts.map((post) => (post.id === postId ? { ...post, ...response.data } : post));
      setPosts(updatedPosts);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [apiService, posts]);

  const deletePost = useCallback(async (postId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        throw new Error('User not authenticated');
      }
      await apiService.delete(`/api/posts/${postId}`);
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiService, posts]);

  useEffect(() => {
    getPosts(currentPage, pageSize);
  }, [getPosts, currentPage, pageSize]);

  return { posts, isLoading, error, currentPage, pageSize, totalCount, getPosts, createPost, updatePost, deletePost };
};

export default usePosts;
```