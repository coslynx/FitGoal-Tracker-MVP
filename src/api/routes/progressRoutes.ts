import express, { Request, Response, Router } from 'express';
import progressController from '../controllers/progressController';
import { authMiddleware } from '../middleware/authMiddleware';

const router: Router = express.Router();

router.post('/progress', authMiddleware, progressController.createProgressEntry);
router.get('/progress', authMiddleware, progressController.getProgressEntries);
router.put('/progress/:id', authMiddleware, progressController.updateProgressEntry);
router.delete('/progress/:id', authMiddleware, progressController.deleteProgressEntry);

export default router;

```