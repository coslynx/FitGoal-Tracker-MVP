import express, { Request, Response } from 'express';
import { progressService } from '../services/progressService';
import { ProgressEntry } from '../models/progressModel';
import { validateProgressInput } from '../utils/validators';
import moment from 'moment';

const router = express.Router();

router.post('/progress', async (req: Request, res: Response) => {
    try {
        const { errors, isValid } = validateProgressInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const newProgressEntry: ProgressEntry = await progressService.createProgressEntry({ ...req.body, date: moment(req.body.date).toDate() }, req.user!.id);
        return res.status(201).json(newProgressEntry);
    } catch (error) {
        console.error('Error creating progress entry:', error);
        return res.status(500).json({ error: 'Failed to create progress entry' });
    }
});

router.get('/progress', async (req: Request, res: Response) => {
    try {
        const progressEntries: ProgressEntry[] = await progressService.getProgressEntries(req.user!.id);
        return res.json(progressEntries);
    } catch (error) {
        console.error('Error retrieving progress entries:', error);
        return res.status(500).json({ error: 'Failed to retrieve progress entries' });
    }
});

router.put('/progress/:id', async (req: Request, res: Response) => {
    try {
        const { errors, isValid } = validateProgressInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const updatedProgressEntry: ProgressEntry | null = await progressService.updateProgressEntry(req.params.id, { ...req.body, date: moment(req.body.date).toDate() }, req.user!.id);
        if (!updatedProgressEntry) {
            return res.status(404).json({ error: 'Progress entry not found' });
        }
        return res.json(updatedProgressEntry);
    } catch (error) {
        console.error('Error updating progress entry:', error);
        return res.status(500).json({ error: 'Failed to update progress entry' });
    }
});

router.delete('/progress/:id', async (req: Request, res: Response) => {
    try {
        await progressService.deleteProgressEntry(req.params.id, req.user!.id);
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting progress entry:', error);
        return res.status(500).json({ error: 'Failed to delete progress entry' });
    }
});

export default router;
```