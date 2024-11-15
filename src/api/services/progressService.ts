import { ProgressEntry, ProgressModel } from '../models/progressModel';
import { ProgressEntryInput, validateProgressInput } from '../../utils/validators';
import moment from 'moment';

class ProgressService {
    async createProgressEntry(progressData: ProgressEntryInput, userId: string): Promise<ProgressEntry> {
        const { errors, isValid } = validateProgressInput(progressData);
        if (!isValid) {
            throw new Error(JSON.stringify(errors));
        }
        const newProgressEntry = await ProgressModel.create({ ...progressData, userId, date: moment(progressData.date).toDate() });
        return newProgressEntry;
    }

    async getProgressEntries(userId: string): Promise<ProgressEntry[]> {
        const progressEntries = await ProgressModel.find({ userId });
        return progressEntries;
    }

    async updateProgressEntry(progressId: string, updates: ProgressEntryInput, userId: string): Promise<ProgressEntry | null> {
        const progressEntry = await ProgressModel.findById(progressId);
        if (!progressEntry || progressEntry.userId !== userId) {
            return null;
        }
        const { errors, isValid } = validateProgressInput(updates);
        if (!isValid) {
            throw new Error(JSON.stringify(errors));
        }
        const updatedProgressEntry = await ProgressModel.findByIdAndUpdate(progressId, { ...updates, date: moment(updates.date).toDate() }, { new: true });
        return updatedProgressEntry;
    }

    async deleteProgressEntry(progressId: string, userId: string): Promise<void> {
        const progressEntry = await ProgressModel.findById(progressId);
        if (!progressEntry || progressEntry.userId !== userId) {
            return;
        }
        await ProgressModel.findByIdAndDelete(progressId);
    }
}

export const progressService = new ProgressService();

```