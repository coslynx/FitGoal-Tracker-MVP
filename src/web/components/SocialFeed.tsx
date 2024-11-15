import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Pagination } from '@material-ui/core';
import { usePosts } from '@web/hooks/usePosts';
import PostCard from './PostCard';
import { useParams } from 'react-router-dom';

interface Post {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    user?: {
        firstName: string;
    }
}

const SocialFeed: React.FC = () => {
    const { page = '1' } = useParams();
    const currentPage = parseInt(page, 10) || 1;
    const { posts, isLoading, error, currentPage: currentPostsPage, pageSize, totalCount, getPosts, deletePost } = usePosts(currentPage, 10);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        getPosts(currentPage, 10);
    }, [currentPage, getPosts]);

    const handleDelete = async (postId: string) => {
        setDeleteError(null);
        try {
            await deletePost(postId);
            getPosts(currentPostsPage, pageSize);
        } catch (error: any) {
            setDeleteError(error.message || 'Failed to delete post');
        }
    };

    const handlePageChange = (event: any, newPage: number) => {
        getPosts(newPage, pageSize);
    };


    if (isLoading) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error">Error fetching posts: {error}</Typography>;
    }

    return (
        <Box>
            {posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}
            {totalCount > pageSize && (
                <Box mt={2} display="flex" justifyContent="center">
                    <Pagination
                        count={Math.ceil(totalCount / pageSize)}
                        page={currentPostsPage}
                        onChange={handlePageChange}
                    />
                </Box>
            )}
            {deleteError && <Typography color="error">{deleteError}</Typography>}
        </Box>
    );
};

export default SocialFeed;
```