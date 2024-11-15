import { useContext, useCallback, useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
  error?: string;
}

const useAuth = (): AuthContextType => {
  const { currentUser, loginUser: setCurrentUser, logoutUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loginUser = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await apiService.post('/api/auth/login', { email, password });
      if (response.error) {
        throw new Error(response.error);
      }
      await setCurrentUser(response.token, response.user);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentUser, navigate]);

  const signupUser = useCallback(async (userData: User) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await apiService.post('/api/auth/register', userData);
      if (response.error) {
        throw new Error(response.error);
      }
      await setCurrentUser(response.token, response.user);
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentUser, navigate]);

  const logoutUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutUser();
      navigate('/login');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [logoutUser, navigate]);

  const isAuthenticated = useCallback(async (token?: string) => {
    try {
      const storedToken = token || localStorage.getItem('token');
      if (!storedToken) return false;
      const decoded = jwt.verify(storedToken, process.env.JWT_SECRET as string) as { id: string };
      const user = await apiService.get<User>(`/api/users/${decoded.id}`);
      return !!user.data;
    } catch (error: any) {
      localStorage.removeItem('token');
      return false;
    }
  }, []);

  useEffect(() => {
      isAuthenticated().then(auth => {
          if(!auth && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
              navigate('/login')
          }
      })
  }, [isAuthenticated, navigate])

  return { currentUser, loginUser, signupUser, logoutUser, isAuthenticated };
};

export default useAuth;
```