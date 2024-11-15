import { render, screen, fireEvent } from '@testing-library/react';
import SignupForm from '@web/components/SignupForm';
import { apiService } from '@web/services/apiService';
import { useAuth } from '@web/hooks/useAuth';
import { act } from 'react-dom/test-utils';
import { validateSignupInput } from '@utils/validators';

jest.mock('@web/services/apiService');
jest.mock('@web/hooks/useAuth');

const mockedApiService = apiService as jest.Mocked<typeof apiService>;
const mockedUseAuth = useAuth as jest.Mocked<typeof useAuth>;

describe('SignupForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      signupUser: jest.fn(),
      isAuthenticated: jest.fn(() => false),
      currentUser: null,
      loginUser: jest.fn(),
    });
  });

  it('should render the signup form', () => {
    render(<SignupForm />);
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  it('should display an error message for invalid input', async () => {
    render(<SignupForm />);
    fireEvent.submit(screen.getByRole('form'));
    expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });

  it('should display an error message if passwords do not match', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'wrongpassword' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(await screen.findByText('Passwords must match')).toBeInTheDocument();
  });


  it('should call signupUser after successful signup', async () => {
    const mockUser = { firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'password'};
    mockedApiService.post.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: mockUser.firstName } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: mockUser.lastName } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: mockUser.email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: mockUser.password } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: mockUser.password } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(mockedUseAuth().signupUser).toHaveBeenCalled();
  });

  it('should handle signup errors', async () => {
    mockedApiService.post.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Signup failed' }),
    });
    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(await screen.findByText('Signup failed')).toBeInTheDocument();
  });

  it('should display a loading indicator while signing up', async () => {
    mockedApiService.post.mockResolvedValueOnce(new Promise((res) => setTimeout(() => res({ ok: true, json: async () => ({}) }), 500)));
    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should handle network errors', async () => {
    mockedApiService.post.mockRejectedValueOnce(new Error('Network error'));
    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('should redirect to home page after successful signup', async () => {
    mockedApiService.post.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    mockedUseAuth.mockReturnValueOnce({
      signupUser: jest.fn(),
      isAuthenticated: jest.fn(() => true),
      currentUser: {id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com'},
      loginUser: jest.fn()
    });
    render(<SignupForm />);
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password' } });
    await act(async () => {
        fireEvent.submit(screen.getByRole('form'));
    });
    expect(window.location.href).toBe('/');
  });
});

```