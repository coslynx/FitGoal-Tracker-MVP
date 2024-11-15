import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@material-ui/core';
import { useAuth } from '@web/hooks/useAuth';
import { useGoals } from '@web/hooks/useGoals';
import { useProgress } from '@web/hooks/useProgress';
import { Goal } from '@api/models/goalInterface';
import { ProgressEntry } from '@api/models/progressInterface';
import ProgressChart from './ProgressChart';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { currentUser, logoutUser, isAuthenticated } = useAuth();
  const { goals, getGoals, isLoadingGoals, errorGoals } = useGoals();
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [errorProgress, setErrorProgress] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [isAuthenticated, navigate]);


  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoadingProgress(true);
        setErrorProgress(null);
          if(goals && goals.length > 0){
            await Promise.all(goals.map(async (goal) => {
              await useProgress(goal.id!);
            }))
          }
        setIsLoadingProgress(false);
      } catch (error: any) {
        setErrorProgress(error.message || 'Failed to fetch progress data');
      }
    };

    if(goals && goals.length > 0){
        fetchProgress();
    }
    
  }, [goals]);


  if (!currentUser) {
    return <CircularProgress />;
  }

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {currentUser.firstName}!
      </Typography>
      {isLoadingGoals ? (
        <CircularProgress />
      ) : errorGoals ? (
        <Typography color="error">{errorGoals}</Typography>
      ) : goals.length === 0 ? (
        <Typography>You haven't set any goals yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} sm={6} md={4} key={goal.id}>
              <ProgressChart goalId={goal.id!} />
            </Grid>
          ))}
        </Grid>
      )}
      {isLoadingProgress && <CircularProgress />}
      {errorProgress && <Typography color="error">{errorProgress}</Typography>}
      <Button onClick={handleLogout}>Logout</Button>

    </Box>
  );
};

export default Dashboard;
```