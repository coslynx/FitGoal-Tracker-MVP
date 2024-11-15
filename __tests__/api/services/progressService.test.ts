import { progressService } from '../../../src/api/services/progressService';
import { ProgressModel } from '../../../src/api/models/progressModel';
import { ProgressEntry, ProgressEntryInput } from '../../../src/api/models/progressInterface';
import { validateProgressInput } from '../../../src/utils/validators';
import moment from 'moment';

jest.mock('../../../src/api/models/progressModel');

const mockedProgressModel = ProgressModel as jest.Mocked<typeof ProgressModel>;

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
    mockedProgressModel.mockClear();
    mockedProgressModel.mockImplementation(() => ({
        create: jest.fn(),
        find: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn()
    }));
});


describe('ProgressService', () => {

    it('should create a new progress entry successfully', async () => {
        const mockProgressEntry: ProgressEntry = {
            id: '1',
            userId: userId,
            goalId: goalId,
            date: moment(validProgressEntry.date).toDate(),
            progressValue: validProgressEntry.progressValue,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockedProgressModel.create.mockResolvedValueOnce(mockProgressEntry);
        const newEntry = await progressService.createProgressEntry(validProgressEntry, userId);
        expect(newEntry).toEqual(mockProgressEntry);
        expect(mockedProgressModel.create).toHaveBeenCalledWith({...validProgressEntry, date: moment(validProgressEntry.date).toDate(), userId});
    });

    it('should throw an error if progress input is invalid', async () => {
        const invalidProgressEntry: ProgressEntryInput = {
            userId: userId,
            goalId: goalId,
            date: 'invalid date',
            progressValue: -10
        };
        await expect(progressService.createProgressEntry(invalidProgressEntry, userId)).rejects.toThrow();
    });


    it('should get all progress entries for a user successfully', async () => {
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
        mockedProgressModel.find.mockResolvedValueOnce(mockProgressEntries);
        const progressEntries = await progressService.getProgressEntries(userId);
        expect(progressEntries).toEqual(mockProgressEntries);
        expect(mockedProgressModel.find).toHaveBeenCalledWith({ userId });
    });

    it('should return an empty array if no progress entries are found', async () => {
        mockedProgressModel.find.mockResolvedValueOnce([]);
        const progressEntries = await progressService.getProgressEntries(userId);
        expect(progressEntries).toEqual([]);
        expect(mockedProgressModel.find).toHaveBeenCalledWith({ userId });
    });

    it('should update an existing progress entry successfully', async () => {
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
        mockedProgressModel.findByIdAndUpdate.mockResolvedValueOnce(updatedProgressEntry);
        const updatedEntry = await progressService.updateProgressEntry(progressId, {...validProgressEntry, ...updates}, userId);
        expect(updatedEntry).toEqual(updatedProgressEntry);
        expect(mockedProgressModel.findByIdAndUpdate).toHaveBeenCalledWith(progressId, { ...validProgressEntry, ...updates, date: moment(validProgressEntry.date).toDate(), userId }, { new: true });
    });

    it('should return null if updating progress entry fails', async () => {
        const progressId = 'nonexistent';
        const updates: Partial<ProgressEntryInput> = { progressValue: 70 };
        mockedProgressModel.findByIdAndUpdate.mockResolvedValueOnce(null);
        const updatedProgressEntry = await progressService.updateProgressEntry(progressId, {...validProgressEntry, ...updates}, userId);
        expect(updatedProgressEntry).toBeNull();
    });

    it('should delete a progress entry successfully', async () => {
        const progressId = '1';
        mockedProgressModel.findByIdAndDelete.mockResolvedValueOnce(undefined);
        await progressService.deleteProgressEntry(progressId, userId);
        expect(mockedProgressModel.findByIdAndDelete).toHaveBeenCalledWith(progressId);
    });

    it('should not throw an error if deleting progress entry fails', async () => {
        const progressId = 'nonexistent';
        mockedProgressModel.findByIdAndDelete.mockResolvedValueOnce(null);
        await progressService.deleteProgressEntry(progressId, userId);
        expect(mockedProgressModel.findByIdAndDelete).toHaveBeenCalledWith(progressId);
    });

    it('should handle errors gracefully during createProgressEntry', async () => {
        mockedProgressModel.create.mockRejectedValueOnce(new Error('Database error'));
        await expect(progressService.createProgressEntry(validProgressEntry, userId)).rejects.toThrow('Database error');
    });

    it('should handle errors gracefully during getProgressEntries', async () => {
        mockedProgressModel.find.mockRejectedValueOnce(new Error('Database error'));
        await expect(progressService.getProgressEntries(userId)).rejects.toThrow('Database error');
    });


    it('should handle errors gracefully during updateProgressEntry', async () => {
        mockedProgressModel.findByIdAndUpdate.mockRejectedValueOnce(new Error('Database error'));
        await expect(progressService.updateProgressEntry('1', validProgressEntry, userId)).rejects.toThrow('Database error');
    });

    it('should handle errors gracefully during deleteProgressEntry', async () => {
        mockedProgressModel.findByIdAndDelete.mockRejectedValueOnce(new Error('Database error'));
        await expect(progressService.deleteProgressEntry('1', userId)).rejects.toThrow('Database error');
    });

});

```