import { render, screen, fireEvent } from '@testing-library/react';
import GoalCard from '@web/components/GoalCard';
import { Goal } from '@api/models/goalInterface';
import { useGoals } from '@web/hooks/useGoals';
import { act } from 'react-dom/test-utils';

jest.mock('@web/hooks/useGoals');

const mockedUseGoals = useGoals as jest.Mocked<typeof useGoals>;

describe('GoalCard', () => {
  const mockGoal: Goal = {
    id: '1',
    userId: 'testuser',
    goalType: 'Weight Loss',
    targetValue: 10,
    deadline: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    progress: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseGoals.mockReturnValue({
      goals: [],
      isLoading: false,
      error: null,
      getGoals: jest.fn(),
      createGoal: jest.fn(),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn(),
    });
  });

  it('should render the GoalCard component', () => {
    mockedUseGoals.mockReturnValue({
        ...mockedUseGoals().mockReturnValue({}),
        updateGoal: jest.fn(),
        deleteGoal: jest.fn()
    })
    render(<GoalCard goal={mockGoal} onGoalUpdate={()=>{}} onGoalDelete={()=>{}} />);
    expect(screen.getByText('Weight Loss')).toBeInTheDocument();
    expect(screen.getByText('Target: 10')).toBeInTheDocument();
    expect(screen.getByText(/Deadline/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should handle goal update successfully', async () => {
    const updatedGoal: Goal = { ...mockGoal, targetValue: 15 };
    mockedUseGoals.mockReturnValue({
      ...mockedUseGoals().mockReturnValue({}),
      updateGoal: jest.fn().mockResolvedValueOnce(updatedGoal),
      deleteGoal: jest.fn()
    });
    const onGoalUpdate = jest.fn();
    render(<GoalCard goal={mockGoal} onGoalUpdate={onGoalUpdate} onGoalDelete={()=>{}} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update/i }));
    });
    expect(mockedUseGoals().updateGoal).toHaveBeenCalledWith('1', mockGoal);
    expect(onGoalUpdate).toHaveBeenCalledWith(updatedGoal);
  });

  it('should handle goal update failure', async () => {
    mockedUseGoals.mockReturnValue({
      ...mockedUseGoals().mockReturnValue({}),
      updateGoal: jest.fn().mockRejectedValueOnce(new Error('Failed to update goal')),
      deleteGoal: jest.fn()
    });
    render(<GoalCard goal={mockGoal} onGoalUpdate={()=>{}} onGoalDelete={()=>{}} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update/i }));
    });
    expect(screen.getByText(/Failed to update goal/i)).toBeInTheDocument();
  });


  it('should handle goal deletion successfully', async () => {
    mockedUseGoals.mockReturnValue({
      ...mockedUseGoals().mockReturnValue({}),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn().mockResolvedValueOnce(undefined),
    });
    const onGoalDelete = jest.fn();
    render(<GoalCard goal={mockGoal} onGoalUpdate={()=>{}} onGoalDelete={onGoalDelete} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    });
    expect(mockedUseGoals().deleteGoal).toHaveBeenCalledWith('1');
    expect(onGoalDelete).toHaveBeenCalledWith('1');
  });

  it('should handle goal deletion failure', async () => {
    mockedUseGoals.mockReturnValue({
      ...mockedUseGoals().mockReturnValue({}),
      updateGoal: jest.fn(),
      deleteGoal: jest.fn().mockRejectedValueOnce(new Error('Failed to delete goal')),
    });
    render(<GoalCard goal={mockGoal} onGoalUpdate={()=>{}} onGoalDelete={()=>{}} />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    });
    expect(screen.getByText(/Failed to delete goal/i)).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    mockedUseGoals.mockReturnValue({
      ...mockedUseGoals().mockReturnValue({}),
      isLoading: true,
      updateGoal: jest.fn(),
      deleteGoal: jest.fn()
    });
    render(<GoalCard goal={mockGoal} onGoalUpdate={()=>{}} onGoalDelete={()=>{}} />);
    expect(screen.queryByText('Weight Loss')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });


  it('should handle invalid goal data', () => {
    const invalidGoal: Partial<Goal> = { goalType: 'Weight Loss' };
    render(<GoalCard goal={invalidGoal as Goal} onGoalUpdate={()=>{}} onGoalDelete={()=>{}} />);
    expect(screen.queryByText(/Invalid goal object/i)).toBeInTheDocument();
  });

  it('should display an error message if no progress data available', () => {
    mockedUseGoals.mockReturnValue({
        ...mockedUseGoals().mockReturnValue({}),
        getGoals: jest.fn().mockResolvedValueOnce([]),
        updateGoal: jest.fn(),
        deleteGoal: jest.fn()
    });
    render(<GoalCard goal={mockGoal} onGoalUpdate={()=>{}} onGoalDelete={()=>{}} />);
    expect(screen.queryByText(/No progress data available./i)).toBeInTheDocument();

});

});
```