import express, { Request, Response, Router } from 'express';
import { goalsController } from '../controllers/goalsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.post('/goals', authMiddleware, goalsController.createGoal);
router.get('/goals', authMiddleware, goalsController.getGoals);
router.put('/goals/:id', authMiddleware, goalsController.updateGoal);
router.delete('/goals/:id', authMiddleware, goalsController.deleteGoal);

export default router;

```