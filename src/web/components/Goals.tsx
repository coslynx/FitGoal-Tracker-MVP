import React, { useEffect } from 'react';
import { Grid, Typography, CircularProgress } from '@material-ui/core';
import { Goal } from '@api/models/goalInterface';
import { useGoals } from '@web/hooks/useGoals';
import GoalCard from './GoalCard';

const Goals: React.FC = () => {
    const { goals, getGoals, isLoading, error, updateGoal, deleteGoal } = useGoals();

    useEffect(() => {
        getGoals();
    }, [getGoals]);

    if (isLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">Error fetching goals: {error}</Typography>;
    }

    return (
        <Grid container spacing={3}>
            {goals.map((goal) => (
                <Grid item xs={12} sm={6} md={4} key={goal.id}>
                    <GoalCard goal={goal} onGoalUpdate={updateGoal} onGoalDelete={deleteGoal} />
                </Grid>
            ))}
        </Grid>
    );
};

export default Goals;
```