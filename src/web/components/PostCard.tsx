import React from 'react';
import { Card, CardContent, Typography, Avatar, Box } from '@material-ui/core';
import { Post } from '@api/models/postModel';
import { formatDate } from '@utils/helpers';
import { usePosts } from '@web/hooks/usePosts';
import { useAuthContext } from '@web/context/AuthContext';

interface PostCardProps {
    post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const { currentUser } = useAuthContext();
    const { deletePost } = usePosts();

    const handleDelete = async () => {
        try {
            await deletePost(post.id!);
        } catch (error: any) {
            console.error('Error deleting post:', error);
        }
    };

    if (!post.content) {
        return <Typography>Post content not found.</Typography>;
    }

    const sanitizedContent = post.content; // Replace with actual sanitization

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" component="h2">
                    {post.user?.firstName || 'Anonymous User'}
                </Typography>
                <Typography variant="body1" component="p" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                <Typography variant="caption">
                    {formatDate(post.createdAt)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button variant="outlined" color="secondary" size="small" onClick={handleDelete}>
                        Delete
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PostCard;
```