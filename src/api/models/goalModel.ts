import { Pool } from 'pg';
import { Goal } from './goalInterface';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export class GoalModel {
    async createGoal(goalData: Goal): Promise<Goal> {
        try {
            const { rows } = await pool.query<Goal>(
                'INSERT INTO goals (user_id, goal_type, target_value, deadline, created_at, updated_at, progress) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [goalData.userId, goalData.goalType, goalData.targetValue, goalData.deadline, goalData.createdAt, goalData.updatedAt, goalData.progress]
            );
            return rows[0];
        } catch (error) {
            console.error('Error creating goal:', error);
            throw new Error('Failed to create goal');
        }
    }

    async getGoals(userId: string): Promise<Goal[]> {
        try {
            const { rows } = await pool.query<Goal>(
                'SELECT * FROM goals WHERE user_id = $1',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error retrieving goals:', error);
            throw new Error('Failed to retrieve goals');
        }
    }

    async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
        try {
            const { rows } = await pool.query<Goal>(
                'UPDATE goals SET goal_type = COALESCE($1, goal_type), target_value = COALESCE($2, target_value), deadline = COALESCE($3, deadline), updated_at = COALESCE($4, updated_at), progress = COALESCE($5, progress) WHERE id = $6 RETURNING *',
                [updates.goalType, updates.targetValue, updates.deadline, updates.updatedAt, updates.progress, goalId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error updating goal:', error);
            throw new Error('Failed to update goal');
        }
    }

    async deleteGoal(goalId: string): Promise<void> {
        try {
            await pool.query(
                'DELETE FROM goals WHERE id = $1',
                [goalId]
            );
        } catch (error) {
            console.error('Error deleting goal:', error);
            throw new Error('Failed to delete goal');
        }
    }
}

export const goalModel = new GoalModel();
```