import { render, screen, fireEvent } from '@testing-library/react';
import PostCard from '@web/components/PostCard';
import { Post } from '@api/models/postModel';
import { usePosts } from '@web/hooks/usePosts';
import { useAuthContext } from '@web/context/AuthContext';
import { act } from 'react-dom/test-utils';
import { formatDate } from '@utils/helpers';

jest.mock('@web/hooks/usePosts');
jest.mock('@web/context/AuthContext');

const mockedUsePosts = usePosts as jest.Mocked<typeof usePosts>;
const mockedUseAuthContext = useAuthContext as jest.Mocked<typeof useAuthContext>;

describe('PostCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePosts.mockReturnValue({
      posts: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
      getPosts: jest.fn(),
      createPost: jest.fn(),
      updatePost: jest.fn(),
      deletePost: jest.fn(),
    });
    mockedUseAuthContext.mockReturnValue({ currentUser: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' } });
  });

  it('should render post content', () => {
    const mockPost: Post = {
      id: '1',
      userId: 1,
      content: 'This is a test post.',
      createdAt: new Date(),
      user: { firstName: 'Test' },
    };
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('This is a test post.')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText(formatDate(mockPost.createdAt))).toBeInTheDocument();
  });

  it('should display a message if post content is missing', () => {
    const mockPost: Post = {
      id: '1',
      userId: 1,
      content: '',
      createdAt: new Date(),
      user: { firstName: 'Test' },
    };
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Post content not found.')).toBeInTheDocument();
  });


  it('should handle null post prop', () => {
    render(<PostCard post={null} />);
    expect(screen.queryByText(/Post content not found/i)).not.toBeInTheDocument();
  });

  it('should handle undefined post prop', () => {
    render(<PostCard post={undefined} />);
    expect(screen.queryByText(/Post content not found/i)).not.toBeInTheDocument();
  });

  it('should call deletePost successfully', async () => {
    const mockPost: Post = {
      id: '1',
      userId: 1,
      content: 'This is a test post.',
      createdAt: new Date(),
      user: { firstName: 'Test' },
    };
    const mockDeletePost = jest.fn();
    mockedUsePosts.mockReturnValue({ ...mockedUsePosts().mockReturnValue({}), deletePost: mockDeletePost });
    render(<PostCard post={mockPost} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    });
    expect(mockDeletePost).toHaveBeenCalledWith('1');
  });

  it('should handle deletePost failure', async () => {
    const mockPost: Post = {
      id: '1',
      userId: 1,
      content: 'This is a test post.',
      createdAt: new Date(),
      user: { firstName: 'Test' },
    };
    const mockDeletePost = jest.fn().mockRejectedValueOnce(new Error('Failed to delete post'));
    mockedUsePosts.mockReturnValue({ ...mockedUsePosts().mockReturnValue({}), deletePost: mockDeletePost });
    render(<PostCard post={mockPost} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    });
    expect(mockDeletePost).toHaveBeenCalledWith('1');
    //Further assertions to check for error handling in PostCard component
  });

  it('should not render delete button if user is not authenticated', () => {
    mockedUseAuthContext.mockReturnValue({ currentUser: null });
    const mockPost: Post = {
      id: '1',
      userId: 1,
      content: 'This is a test post.',
      createdAt: new Date(),
      user: { firstName: 'Test' },
    };
    render(<PostCard post={mockPost} />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });


});
```