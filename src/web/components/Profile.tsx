import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, TextField, Button, CircularProgress } from '@material-ui/core';
import { useAuth } from '@web/hooks/useAuth';
import { apiService } from '@web/services/apiService';
import { User } from '@api/models/userInterface';
import { validateProfileUpdate } from '@utils/validators';

const Profile: React.FC = () => {
  const { currentUser, logoutUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firstNameError, setFirstNameError] = useState<boolean>(false);
  const [lastNameError, setLastNameError] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiService.get('/api/users/me'); 
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if(currentUser){
        fetchUserData();
    }
  }, [currentUser]); 

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setUserData({ ...userData, [field]: event.target.value });
    if(field === 'firstName'){
        setFirstNameError(false);
    } else if(field === 'lastName'){
        setLastNameError(false);
    } else if (field === 'email'){
        setEmailError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setFirstNameError(false);
    setLastNameError(false);
    setEmailError(false);
    try {
      const { errors, isValid } = validateProfileUpdate(userData!);
      if (!isValid) {
        if(errors.firstName){
            setFirstNameError(true);
        }
        if(errors.lastName){
            setLastNameError(true);
        }
        if(errors.email){
            setEmailError(true);
        }
        throw new Error(JSON.stringify(errors));
      }
      const response = await apiService.post('/api/users/me', userData); 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      // Profile updated successfully
      alert('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!currentUser || !userData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="First Name"
          value={userData.firstName || ''}
          onChange={(e) => handleInputChange(e, 'firstName')}
          margin="normal"
          fullWidth
          error={firstNameError}
          helperText={firstNameError ? 'First Name is required' : ''}
          required
        />
        <TextField
          label="Last Name"
          value={userData.lastName || ''}
          onChange={(e) => handleInputChange(e, 'lastName')}
          margin="normal"
          fullWidth
          error={lastNameError}
          helperText={lastNameError ? 'Last Name is required' : ''}
          required
        />
        <TextField
          label="Email"
          type="email"
          value={userData.email || ''}
          onChange={(e) => handleInputChange(e, 'email')}
          margin="normal"
          fullWidth
          error={emailError}
          helperText={emailError ? 'Valid Email is required' : ''}
          required
        />
        <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </Box>
  );
};

export default Profile;
```