import React, { useState } from 'react';
import { Box, Typography, TextField, FormControl, FormHelperText } from '@material-ui/core';
import Input from './Input';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { validateSignupInput } from '../../utils/validators';

interface SignupFormProps {}

const SignupForm: React.FC<SignupFormProps> = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signupUser, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { errors, isValid } = validateSignupInput({ firstName, lastName, email, password, confirmPassword });
      if (!isValid) {
        throw new Error(JSON.stringify(errors));
      }

      const response = await apiService.post('/api/auth/register', { firstName, lastName, email, password });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sign up.');
      }

      await signupUser();

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    window.location.href = '/';
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" width={300} margin="auto">
        <Typography variant="h5" align="center" gutterBottom>Sign Up</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Input
          label="First Name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          margin="normal"
          fullWidth
          required
        />
        <Input
          label="Last Name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          margin="normal"
          fullWidth
          required
        />
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
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          fullWidth
          required
        />
        <Button type="submit" fullWidth variant="contained" color="primary" isLoading={isLoading}>
          Sign Up
        </Button>
      </Box>
    </form>
  );
};

export default SignupForm;
```