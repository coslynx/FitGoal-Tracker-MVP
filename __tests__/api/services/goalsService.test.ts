import { goalsService } from '../../../src/api/services/goalsService';
import { Goal } from '../../../src/api/models/goalModel';
import { GoalModel } from '../../../src/api/models/goalModel';
import { validateGoalInput } from '../../../src/utils/validators';
import moment from 'moment';

jest.mock('../../../src/api/models/goalModel');

const mockedGoalModel = GoalModel as jest.Mocked<typeof GoalModel>;

describe('GoalsService', () => {
    const userId = 'testuser';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new goal successfully', async () => {
        const goalData: Partial<Goal> = {
            goalType: 'Weight Loss',
            targetValue: 10,
            deadline: moment().add(1, 'month').toDate(),
        };

        const newGoal: Goal = {
            id: '1',
            userId: userId,
            goalType: goalData.goalType!,
            targetValue: goalData.targetValue!,
            deadline: goalData.deadline,
            createdAt: new Date(),
            updatedAt: new Date(),
            progress: 0,
        };

        mockedGoalModel.createGoal.mockResolvedValueOnce(newGoal);

        const createdGoal = await goalsService.createGoal(goalData, userId);

        expect(createdGoal).toEqual(newGoal);
        expect(mockedGoalModel.createGoal).toHaveBeenCalledWith(newGoal);
    });

    it('should throw an error if goal input is invalid', async () => {
        const invalidGoalData: Partial<Goal> = {
            goalType: '',
            targetValue: -10,
            deadline: new Date('invalid date'),
        };

        await expect(goalsService.createGoal(invalidGoalData, userId)).rejects.toThrow();
    });

    it('should throw an error if creating a goal fails', async () => {
        const goalData: Partial<Goal> = {
            goalType: 'Weight Loss',
            targetValue: 10,
            deadline: moment().add(1, 'month').toDate(),
        };

        mockedGoalModel.createGoal.mockRejectedValueOnce(new Error('Failed to create goal'));

        await expect(goalsService.createGoal(goalData, userId)).rejects.toThrow('Failed to create goal');
    });


    it('should get all goals for a user successfully', async () => {
        const mockGoals: Goal[] = [
            {
                id: '1',
                userId: userId,
                goalType: 'Weight Loss',
                targetValue: 10,
                deadline: moment().add(1, 'month').toDate(),
                createdAt: new Date(),
                updatedAt: new Date(),
                progress: 50,
            },
            {
                id: '2',
                userId: userId,
                goalType: 'Muscle Gain',
                targetValue: 5,
                deadline: moment().add(2, 'month').toDate(),
                createdAt: new Date(),
                updatedAt: new Date(),
                progress: 25,
            },
        ];

        mockedGoalModel.getGoals.mockResolvedValueOnce(mockGoals);

        const retrievedGoals = await goalsService.getGoals(userId);

        expect(retrievedGoals).toEqual(mockGoals);
        expect(mockedGoalModel.getGoals).toHaveBeenCalledWith(userId);
    });

    it('should return an empty array if no goals are found for the user', async () => {
        mockedGoalModel.getGoals.mockResolvedValueOnce([]);
        const goals = await goalsService.getGoals(userId);
        expect(goals).toEqual([]);
    });

    it('should throw an error if retrieving goals fails', async () => {
        mockedGoalModel.getGoals.mockRejectedValueOnce(new Error('Failed to retrieve goals'));
        await expect(goalsService.getGoals(userId)).rejects.toThrow('Failed to retrieve goals');
    });

    it('should update an existing goal successfully', async () => {
        const goalId = '1';
        const updates: Partial<Goal> = { targetValue: 15 };
        const updatedGoal: Goal = {
            id: goalId,
            userId: userId,
            goalType: 'Weight Loss',
            targetValue: 15,
            deadline: moment().add(1, 'month').toDate(),
            createdAt: new Date(),
            updatedAt: new Date(),
            progress: 0,
        };

        mockedGoalModel.updateGoal.mockResolvedValueOnce(updatedGoal);
        const updated = await goalsService.updateGoal(goalId, updates, userId);
        expect(updated).toEqual(updatedGoal);
        expect(mockedGoalModel.updateGoal).toHaveBeenCalledWith(goalId, updates);
    });

    it('should return null if goal not found or unauthorized', async () => {
        const goalId = 'nonexistent';
        const updates: Partial<Goal> = { targetValue: 15 };
        mockedGoalModel.updateGoal.mockResolvedValueOnce(null);
        const updatedGoal = await goalsService.updateGoal(goalId, updates, userId);
        expect(updatedGoal).toBeNull();
    });

    it('should throw an error if updating a goal fails', async () => {
        const goalId = '1';
        const updates: Partial<Goal> = { targetValue: 15 };
        mockedGoalModel.updateGoal.mockRejectedValueOnce(new Error('Failed to update goal'));
        await expect(goalsService.updateGoal(goalId, updates, userId)).rejects.toThrow('Failed to update goal');
    });


    it('should delete a goal successfully', async () => {
        const goalId = '1';
        mockedGoalModel.deleteGoal.mockResolvedValueOnce(undefined);
        await goalsService.deleteGoal(goalId, userId);
        expect(mockedGoalModel.deleteGoal).toHaveBeenCalledWith(goalId);
    });

    it('should not throw error if goal not found', async () => {
        const goalId = 'nonexistent';
        mockedGoalModel.deleteGoal.mockResolvedValueOnce(undefined);
        await goalsService.deleteGoal(goalId, userId);
        expect(mockedGoalModel.deleteGoal).toHaveBeenCalledWith(goalId);
    });

    it('should throw an error if deleting a goal fails', async () => {
        const goalId = '1';
        mockedGoalModel.deleteGoal.mockRejectedValueOnce(new Error('Failed to delete goal'));
        await expect(goalsService.deleteGoal(goalId, userId)).rejects.toThrow('Failed to delete goal');
    });
});
```