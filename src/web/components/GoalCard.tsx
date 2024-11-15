import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, LinearProgress, Box } from '@material-ui/core';
import { Goal } from '@api/models/goalInterface';
import { apiService } from '@web/services/apiService';
import { useGoals } from '@web/hooks/useGoals';

interface GoalCardProps {
    goal: Goal;
    onGoalUpdate: (updatedGoal: Goal) => void;
    onGoalDelete: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onGoalUpdate, onGoalDelete }) => {
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const { updateGoal, deleteGoal, isLoading } = useGoals();

    const handleUpdate = async () => {
        setUpdateError(null);
        try {
            const updatedGoal = await updateGoal(goal.id!, goal);
            if (updatedGoal) {
                onGoalUpdate(updatedGoal);
            }
        } catch (error: any) {
            setUpdateError(error.message || 'Failed to update goal');
        }
    };

    const handleDelete = async () => {
        setDeleteError(null);
        try {
            await deleteGoal(goal.id!);
            onGoalDelete(goal.id!);
        } catch (error: any) {
            setDeleteError(error.message || 'Failed to delete goal');
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="h2">
                    {goal.goalType}
                </Typography>
                <Typography variant="body1" component="p">
                    Target: {goal.targetValue}
                </Typography>
                <Typography variant="body1" component="p">
                    Deadline: {goal.deadline.toDateString()}
                </Typography>
                <Box sx={{ width: '100%' }}>
                    <LinearProgress variant="determinate" value={goal.progress} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleUpdate} disabled={isLoading}>
                        Update
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleDelete} disabled={isLoading}>
                        Delete
                    </Button>
                </Box>
                {updateError && <Typography color="error">{updateError}</Typography>}
                {deleteError && <Typography color="error">{deleteError}</Typography>}
            </CardContent>
        </Card>
    );
};

export default GoalCard;

```