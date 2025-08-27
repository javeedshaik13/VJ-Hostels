import { Router } from 'express';
import { calculateAndUpdateFoodCount } from '../controllers/foodCountController';

const router = Router();

// POST /api/food-count/calculate
router.post('/calculate', calculateAndUpdateFoodCount);

export default router;
