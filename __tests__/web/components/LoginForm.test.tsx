import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '@web/components/LoginForm';
import { apiService } from '@web/services/apiService';
import { useAuth } from '@web/hooks/useAuth';
import { act } from 'react-dom/test-utils';

jest.mock('@web/services/apiService');
jest.mock('@web/hooks/useAuth');

const mockedApiService = apiService as jest.Mocked<typeof apiService>;
const mockedUseAuth = useAuth as jest.Mocked<typeof useAuth>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      loginUser: jest.fn(),
      isAuthenticated: jest.fn(() => false),
      currentUser: null,
      signupUser: jest.fn()
    });
  });

  it('should render the login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });


  it('should display an error message for invalid credentials', async () => {
    mockedApiService.post.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });


  it('should display an error message if required fields are missing', async () => {
    render(<LoginForm />);
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(screen.getByText('Email and password are required.')).toBeInTheDocument();
  });

  it('should call loginUser after successful login', async () => {
    const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' };
    const mockToken = 'testtoken';
    mockedApiService.post.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, user: mockUser }),
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(mockedUseAuth().loginUser).toHaveBeenCalledWith(mockToken, mockUser);
  });


  it('should display a loading indicator while logging in', async () => {
    mockedApiService.post.mockResolvedValueOnce(new Promise((res) => setTimeout(() => res({ ok: true, json: async () => ({ token: 'testtoken', user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' } }) }), 500)));
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });


  it('should handle network errors gracefully', async () => {
    mockedApiService.post.mockRejectedValueOnce(new Error('Network error'));
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });


  it('should handle invalid server responses', async () => {
    mockedApiService.post.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Invalid server response' }) });
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(screen.getByText('Invalid server response')).toBeInTheDocument();
  });

  it('should redirect to the home page after successful login', async () => {
    const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com' };
    const mockToken = 'testtoken';
    mockedApiService.post.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken, user: mockUser }),
    });
    mockedUseAuth.mockReturnValueOnce({
      loginUser: jest.fn(),
      isAuthenticated: jest.fn(() => true),
      currentUser: mockUser,
      signupUser: jest.fn()
    });
    const { container } = render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(window.location.href).toBe('/');
  });


});
```