import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User } from '@api/models/userInterface';
import { useAuth } from '@web/hooks/useAuth';
import { useNavigate } from 'react-router-dom';


interface AuthContextType {
  currentUser: User | null;
  loginUser: (token: string, user: User) => Promise<void>;
  logoutUser: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { loginUser: useAuthLogin, logoutUser: useAuthLogout, isAuthenticated: useAuthIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const loginUser = useCallback(async (token: string, user: User) => {
    try {
      await useAuthLogin(token, user);
      setCurrentUser(user);
      localStorage.setItem('token', token);
      navigate('/');

    } catch (error) {
      console.error('Login failed:', error);
      //Handle error appropriately, perhaps display an error message.
    }
  }, [useAuthLogin, navigate]);


  const logoutUser = useCallback(async () => {
    try {
      await useAuthLogout();
      setCurrentUser(null);
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      //Handle error appropriately, perhaps display an error message.
    }
  }, [useAuthLogout, navigate]);


  const isAuthenticated = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if(!token) return false;
      return await useAuthIsAuthenticated(token);

    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  }, [useAuthIsAuthenticated]);


  useEffect(() => {
    const checkAuth = async () => {
      try{
        const authenticated = await isAuthenticated();
        if (!authenticated && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          navigate('/login');
        }
      } catch(error){
        console.error("Error checking authentication on mount:", error);
      }
    }
    checkAuth();
  }, [isAuthenticated, navigate]);

  return (
    <AuthContext.Provider value={{ currentUser, loginUser, logoutUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
```