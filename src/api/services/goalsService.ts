import { Goal, GoalModel } from '../models/goalModel';
import { validateGoalInput } from '../../utils/validators';
import moment from 'moment';

class GoalsService {
    async createGoal(goalData: Partial<Goal>, userId: string): Promise<Goal> {
        const { errors, isValid } = validateGoalInput(goalData);
        if (!isValid) {
            throw new Error(JSON.stringify(errors));
        }
        const newGoalData = { ...goalData, userId, createdAt: moment().toDate() };
        const newGoal = await GoalModel.create(newGoalData);
        return newGoal;
    }

    async getGoals(userId: string): Promise<Goal[]> {
        const goals = await GoalModel.find({ userId });
        return goals;
    }

    async updateGoal(goalId: string, updates: Partial<Goal>, userId: string): Promise<Goal | null> {
        const goal = await GoalModel.findById(goalId);
        if (!goal || goal.userId !== userId) {
            return null;
        }
        const { errors, isValid } = validateGoalInput(updates);
        if (!isValid) {
            throw new Error(JSON.stringify(errors));
        }
        const updatedGoal = await GoalModel.findByIdAndUpdate(goalId, updates, { new: true });
        return updatedGoal;
    }

    async deleteGoal(goalId: string, userId: string): Promise<void> {
        const goal = await GoalModel.findById(goalId);
        if (!goal || goal.userId !== userId) {
            return;
        }
        await GoalModel.findByIdAndDelete(goalId);
    }
}

export const goalsService = new GoalsService();

```