import express, { Request, Response } from 'express';
import { goalsService } from '../services/goalsService';
import { Goal } from '../models/goalModel';
import { validateGoalInput } from '../utils/validators';

const router = express.Router();

router.post('/goals', async (req: Request, res: Response) => {
    try {
        const { errors, isValid } = validateGoalInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const newGoal: Goal = await goalsService.createGoal(req.body, req.user!.id);
        return res.status(201).json(newGoal);
    } catch (error) {
        console.error('Error creating goal:', error);
        return res.status(500).json({ error: 'Failed to create goal' });
    }
});

router.get('/goals', async (req: Request, res: Response) => {
    try {
        const goals: Goal[] = await goalsService.getGoals(req.user!.id);
        return res.json(goals);
    } catch (error) {
        console.error('Error retrieving goals:', error);
        return res.status(500).json({ error: 'Failed to retrieve goals' });
    }
});

router.put('/goals/:id', async (req: Request, res: Response) => {
    try {
        const { errors, isValid } = validateGoalInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const updatedGoal: Goal | null = await goalsService.updateGoal(req.params.id, req.body, req.user!.id);
        if (!updatedGoal) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        return res.json(updatedGoal);
    } catch (error) {
        console.error('Error updating goal:', error);
        return res.status(500).json({ error: 'Failed to update goal' });
    }
});

router.delete('/goals/:id', async (req: Request, res: Response) => {
    try {
        await goalsService.deleteGoal(req.params.id, req.user!.id);
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting goal:', error);
        return res.status(500).json({ error: 'Failed to delete goal' });
    }
});

export default router;

```