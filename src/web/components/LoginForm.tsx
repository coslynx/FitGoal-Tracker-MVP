import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { Box, Typography } from '@material-ui/core';

interface LoginFormProps {}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginUser, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      const response = await apiService.post('/api/auth/login', { email, password });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log in.');
      }

      const data = await response.json();
      await loginUser(data.token, data.user);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if(isAuthenticated){
    window.location.href = '/'; // Redirect to the main page
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" width={300} margin="auto">
        <Typography variant="h5" align="center" gutterBottom>Login</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          fullWidth
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          fullWidth
          required
        />
        <Button type="submit" fullWidth variant="contained" color="primary" isLoading={isLoading}>
          Login
        </Button>
      </Box>
    </form>
  );
};

export default LoginForm;
```