import request from 'supertest';
import { app } from '../../../src/api/index';
import { goalsService } from '../../../src/api/services/goalsService';
import { Goal } from '../../../src/api/models/goalModel';
import { validateGoalInput } from '../../../src/utils/validators';

jest.mock('../../../src/api/services/goalsService');

describe('Goals Controller', () => {
    const mockedGoalsService = goalsService as jest.Mocked<typeof goalsService>;

    it('should create a new goal', async () => {
        const mockGoalData: Partial<Goal> = {
            goalType: 'Weight Loss',
            targetValue: 10,
            deadline: new Date(),
            userId: 'testuser'
        };

        mockedGoalsService.createGoal.mockResolvedValueOnce({
            id: '1',
            ...mockGoalData,
            createdAt: new Date(),
            updatedAt: new Date(),
            progress: 0
        } as Goal);

        const response = await request(app).post('/api/goals').send(mockGoalData);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            id: '1',
            ...mockGoalData,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            progress: 0
        });
        expect(mockedGoalsService.createGoal).toHaveBeenCalledWith(mockGoalData, 'testuser');
    });

    it('should return 400 if goal input is invalid', async () => {
        const mockGoalData: Partial<Goal> = {
            goalType: '',
            targetValue: -10,
            deadline: new Date('invalid date'),
            userId: 'testuser'
        };
        const response = await request(app).post('/api/goals').send(mockGoalData);
        expect(response.status).toBe(400);
        expect(response.body).toEqual(validateGoalInput(mockGoalData).errors);
    });


    it('should return 500 if creating goal fails', async () => {
        mockedGoalsService.createGoal.mockRejectedValueOnce(new Error('Failed to create goal'));
        const mockGoalData: Partial<Goal> = {
            goalType: 'Weight Loss',
            targetValue: 10,
            deadline: new Date(),
            userId: 'testuser'
        };
        const response = await request(app).post('/api/goals').send(mockGoalData);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to create goal');
    });

    it('should get all goals for a user', async () => {
        const mockGoals: Goal[] = [
            {
                id: '1',
                userId: 'testuser',
                goalType: 'Weight Loss',
                targetValue: 10,
                deadline: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                progress: 50
            },
            {
                id: '2',
                userId: 'testuser',
                goalType: 'Muscle Gain',
                targetValue: 5,
                deadline: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
                progress: 25
            }
        ];
        mockedGoalsService.getGoals.mockResolvedValueOnce(mockGoals);
        const response = await request(app).get('/api/goals').set('Authorization', 'Bearer token');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockGoals);
        expect(mockedGoalsService.getGoals).toHaveBeenCalledWith('testuser');
    });

    it('should return 500 if getting goals fails', async () => {
        mockedGoalsService.getGoals.mockRejectedValueOnce(new Error('Failed to get goals'));
        const response = await request(app).get('/api/goals').set('Authorization', 'Bearer token');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to retrieve goals');
    });

    it('should update an existing goal', async () => {
        const goalId = '1';
        const updates: Partial<Goal> = { targetValue: 15 };
        const updatedGoal: Goal = {
            id: goalId,
            userId: 'testuser',
            goalType: 'Weight Loss',
            targetValue: 15,
            deadline: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            progress: 0
        };
        mockedGoalsService.updateGoal.mockResolvedValueOnce(updatedGoal);
        const response = await request(app).put(`/api/goals/${goalId}`).send(updates);
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedGoal);
        expect(mockedGoalsService.updateGoal).toHaveBeenCalledWith(goalId, updates, 'testuser');
    });

    it('should return 404 if updating goal fails', async () => {
        const goalId = 'nonexistent';
        const updates: Partial<Goal> = { targetValue: 15 };
        mockedGoalsService.updateGoal.mockResolvedValueOnce(null);
        const response = await request(app).put(`/api/goals/${goalId}`).send(updates);
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Goal not found');
    });


    it('should return 400 if update goal input is invalid', async () => {
        const goalId = '1';
        const updates: Partial<Goal> = { targetValue: -15 };
        const response = await request(app).put(`/api/goals/${goalId}`).send(updates);
        expect(response.status).toBe(400);
        expect(response.body).toEqual(validateGoalInput(updates).errors);
    });

    it('should delete a goal', async () => {
        const goalId = '1';
        mockedGoalsService.deleteGoal.mockResolvedValueOnce(undefined);
        const response = await request(app).delete(`/api/goals/${goalId}`);
        expect(response.status).toBe(204);
        expect(mockedGoalsService.deleteGoal).toHaveBeenCalledWith(goalId, 'testuser');
    });

    it('should return 500 if deleting goal fails', async () => {
        const goalId = '1';
        mockedGoalsService.deleteGoal.mockRejectedValueOnce(new Error('Failed to delete goal'));
        const response = await request(app).delete(`/api/goals/${goalId}`);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to delete goal');
    });
});

```