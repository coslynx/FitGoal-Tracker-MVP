import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { ProgressEntry, ProgressEntryInput } from '@api/models/progressInterface';

interface UseProgressResponse {
  progressEntries: ProgressEntry[];
  isLoading: boolean;
  error: string | null;
  getProgress: (goalId: string) => Promise<void>;
  updateProgress: (progressId: string, updates: ProgressEntryInput) => Promise<ProgressEntry | null>;
  createProgress: (progressData: ProgressEntryInput) => Promise<ProgressEntry | null>;
  deleteProgress: (progressId: string) => Promise<void>;
}

const useProgress = (goalId: string): UseProgressResponse => {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProgress = useCallback(async (goalId:string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.get<ProgressEntry[]>(`/api/progress?goalId=${goalId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      setProgressEntries(response.data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiService]);

  const createProgress = useCallback(async (progressData: ProgressEntryInput): Promise<ProgressEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.post<ProgressEntryInput, ProgressEntry>('/api/progress', progressData);
      if (response.error) {
        throw new Error(response.error);
      }
      setProgressEntries([...progressEntries, response.data]);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [progressEntries, apiService]);

  const updateProgress = useCallback(async (progressId: string, updates: ProgressEntryInput): Promise<ProgressEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.put<ProgressEntryInput, ProgressEntry>(`/api/progress/${progressId}`, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      const updatedEntries = progressEntries.map((entry) =>
        entry.id === progressId ? { ...entry, ...response.data } : entry
      );
      setProgressEntries(updatedEntries);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [progressEntries, apiService]);

  const deleteProgress = useCallback(async (progressId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiService.delete(`/api/progress/${progressId}`);
      setProgressEntries(progressEntries.filter((entry) => entry.id !== progressId));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [progressEntries, apiService]);

  useEffect(() => {
    if (goalId) {
      getProgress(goalId);
    }
  }, [goalId, getProgress]);

  return { progressEntries, isLoading, error, getProgress, updateProgress, createProgress, deleteProgress };
};

export default useProgress;
```