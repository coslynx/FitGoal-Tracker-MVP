import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { Goal } from '@api/models/goalInterface';
import { useAuth } from './useAuth';
import { validateGoalInput } from '@utils/validators';

interface UseGoalsResponse {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  getGoals: () => Promise<void>;
  createGoal: (goalData: Partial<Goal>) => Promise<Goal | null>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<Goal | null>;
  deleteGoal: (goalId: string) => Promise<void>;
}


const useGoals = (): UseGoalsResponse => {
  const { isAuthenticated } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        throw new Error('User not authenticated');
      }
      const response = await apiService.get<Goal[]>('/api/goals');
      if (response.error) {
        throw new Error(response.error);
      }
      setGoals(response.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, apiService]);

  const createGoal = useCallback(async (goalData: Partial<Goal>): Promise<Goal | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { errors, isValid } = validateGoalInput(goalData);
      if (!isValid) {
        throw new Error(JSON.stringify(errors));
      }
      const response = await apiService.post<Partial<Goal>, Goal>('/api/goals', goalData);
      if (response.error) {
        throw new Error(response.error);
      }
      setGoals([...goals, response.data]);
      return response.data
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [goals, apiService]);

  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>): Promise<Goal | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { errors, isValid } = validateGoalInput(updates);
      if (!isValid) {
        throw new Error(JSON.stringify(errors));
      }
      const response = await apiService.put<Partial<Goal>, Goal>(`/api/goals/${goalId}`, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      const updatedGoals = goals.map((goal) =>
        goal.id === goalId ? { ...goal, ...response.data } : goal
      );
      setGoals(updatedGoals);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [goals, apiService]);

  const deleteGoal = useCallback(async (goalId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.delete(`/api/goals/${goalId}`);
      setGoals(goals.filter((goal) => goal.id !== goalId));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [goals, apiService]);

  useEffect(() => {
    getGoals();
  }, [getGoals]);

  return { goals, isLoading, error, getGoals, createGoal, updateGoal, deleteGoal };
};

export default useGoals;

```