import { Pool } from 'pg';
import { ProgressEntry, ProgressEntryInput } from './progressInterface';
import { ValidationError } from '../../utils/errors';
import { validateProgressInput } from '../../utils/validators';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class ProgressModel {
    async createProgressEntry(progressData: ProgressEntryInput): Promise<ProgressEntry> {
        const { errors, isValid } = validateProgressInput(progressData);
        if (!isValid) {
            throw new ValidationError(errors);
        }
        try {
            const { rows } = await pool.query<ProgressEntry>(
                'INSERT INTO progress (user_id, goal_id, date, progress_value, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
                [progressData.userId, progressData.goalId, progressData.date, progressData.progressValue]
            );
            return rows[0];
        } catch (error) {
            console.error('Error creating progress entry:', error);
            throw new Error('Failed to create progress entry');
        }
    }

    async getProgressEntries(userId: string, goalId?: string): Promise<ProgressEntry[]> {
        try {
            const query = 'SELECT * FROM progress WHERE user_id = $1';
            const values = [userId];
            if (goalId) {
                query += ' AND goal_id = $2';
                values.push(goalId);
            }
            const { rows } = await pool.query<ProgressEntry>(query, values);
            return rows;
        } catch (error) {
            console.error('Error retrieving progress entries:', error);
            throw new Error('Failed to retrieve progress entries');
        }
    }

    async updateProgressEntry(progressId: string, updates: Partial<ProgressEntryInput>): Promise<ProgressEntry | null> {
        const { errors, isValid } = validateProgressInput(updates);
        if (!isValid) {
            throw new ValidationError(errors);
        }
        try {
            const { rows } = await pool.query<ProgressEntry>(
                'UPDATE progress SET progress_value = COALESCE($1, progress_value), updated_at = NOW() WHERE id = $2 RETURNING *',
                [updates.progressValue, progressId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error updating progress entry:', error);
            throw new Error('Failed to update progress entry');
        }
    }

    async deleteProgressEntry(progressId: string): Promise<void> {
        try {
            await pool.query('DELETE FROM progress WHERE id = $1', [progressId]);
        } catch (error) {
            console.error('Error deleting progress entry:', error);
            throw new Error('Failed to delete progress entry');
        }
    }
}
```
```typescript
// src/api/models/progressInterface.ts
import { Types } from 'mongoose';

export interface ProgressEntry {
    id: string;
    userId: string;
    goalId: string;
    date: Date;
    progressValue: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProgressEntryInput {
    userId: string;
    goalId: string;
    date: string | Date;
    progressValue: number;
}