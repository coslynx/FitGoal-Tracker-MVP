import request from 'supertest';
import { app } from '../../../src/api/index';
import { progressService } from '../../../src/api/services/progressService';
import { ProgressEntry, ProgressEntryInput } from '../../../src/api/models/progressModel';
import { validateProgressInput } from '../../../src/utils/validators';
import moment from 'moment';

jest.mock('../../../src/api/services/progressService');

const mockedProgressService = progressService as jest.Mocked<typeof progressService>;

describe('Progress Controller', () => {
    const userId = 'testuser';
    const goalId = 'testgoal';

    const validProgressEntry: ProgressEntryInput = {
        userId: userId,
        goalId: goalId,
        date: moment().format('YYYY-MM-DD'),
        progressValue: 50
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new progress entry', async () => {
        const mockProgressEntry: ProgressEntry = {
            id: '1',
            userId: userId,
            goalId: goalId,
            date: moment(validProgressEntry.date).toDate(),
            progressValue: validProgressEntry.progressValue,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockedProgressService.createProgressEntry.mockResolvedValueOnce(mockProgressEntry);
        const response = await request(app).post('/api/progress').send(validProgressEntry);
        expect(response.status).toBe(201);
        expect(response.body).toEqual(mockProgressEntry);
        expect(mockedProgressService.createProgressEntry).toHaveBeenCalledWith(
            { ...validProgressEntry, date: moment(validProgressEntry.date).toDate() },
            userId
        );
    });

    it('should return 400 if progress input is invalid', async () => {
        const invalidProgressEntry: ProgressEntryInput = {
            userId: userId,
            goalId: goalId,
            date: 'invalid date',
            progressValue: -10
        };
        const response = await request(app).post('/api/progress').send(invalidProgressEntry);
        expect(response.status).toBe(400);
        expect(response.body).toEqual(validateProgressInput(invalidProgressEntry).errors);
    });

    it('should return 500 if creating progress entry fails', async () => {
        mockedProgressService.createProgressEntry.mockRejectedValueOnce(new Error('Failed to create progress entry'));
        const response = await request(app).post('/api/progress').send(validProgressEntry);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to create progress entry');
    });

    it('should get all progress entries for a user', async () => {
        const mockProgressEntries: ProgressEntry[] = [
            {
                id: '1',
                userId: userId,
                goalId: goalId,
                date: new Date(),
                progressValue: 50,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                userId: userId,
                goalId: goalId,
                date: new Date(),
                progressValue: 75,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        mockedProgressService.getProgressEntries.mockResolvedValueOnce(mockProgressEntries);
        const response = await request(app).get('/api/progress').set('Authorization', 'Bearer token');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockProgressEntries);
        expect(mockedProgressService.getProgressEntries).toHaveBeenCalledWith(userId);
    });

    it('should return 500 if getting progress entries fails', async () => {
        mockedProgressService.getProgressEntries.mockRejectedValueOnce(new Error('Failed to get progress entries'));
        const response = await request(app).get('/api/progress').set('Authorization', 'Bearer token');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to retrieve progress entries');
    });

    it('should update an existing progress entry', async () => {
        const progressId = '1';
        const updates: Partial<ProgressEntryInput> = { progressValue: 70 };
        const updatedProgressEntry: ProgressEntry = {
            id: progressId,
            userId: userId,
            goalId: goalId,
            date: new Date(),
            progressValue: 70,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockedProgressService.updateProgressEntry.mockResolvedValueOnce(updatedProgressEntry);
        const response = await request(app).put(`/api/progress/${progressId}`).send({...validProgressEntry,...updates});
        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedProgressEntry);
        expect(mockedProgressService.updateProgressEntry).toHaveBeenCalledWith(progressId, { ...validProgressEntry,...updates, date: moment(validProgressEntry.date).toDate() }, userId);
    });

    it('should return 404 if updating progress entry fails', async () => {
        const progressId = 'nonexistent';
        const updates: Partial<ProgressEntryInput> = { progressValue: 70 };
        mockedProgressService.updateProgressEntry.mockResolvedValueOnce(null);
        const response = await request(app).put(`/api/progress/${progressId}`).send({...validProgressEntry,...updates});
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Progress entry not found');
    });

    it('should return 400 if update progress input is invalid', async () => {
        const progressId = '1';
        const updates: Partial<ProgressEntryInput> = { progressValue: -70 };
        const response = await request(app).put(`/api/progress/${progressId}`).send({...validProgressEntry,...updates});
        expect(response.status).toBe(400);
        expect(response.body).toEqual(validateProgressInput({...validProgressEntry,...updates}).errors);
    });


    it('should delete a progress entry', async () => {
        const progressId = '1';
        mockedProgressService.deleteProgressEntry.mockResolvedValueOnce(undefined);
        const response = await request(app).delete(`/api/progress/${progressId}`);
        expect(response.status).toBe(204);
        expect(mockedProgressService.deleteProgressEntry).toHaveBeenCalledWith(progressId, userId);
    });

    it('should return 500 if deleting progress entry fails', async () => {
        const progressId = '1';
        mockedProgressService.deleteProgressEntry.mockRejectedValueOnce(new Error('Failed to delete progress entry'));
        const response = await request(app).delete(`/api/progress/${progressId}`);
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to delete progress entry');
    });
});
```