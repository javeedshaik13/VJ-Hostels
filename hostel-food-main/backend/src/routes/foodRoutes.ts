import { Router } from 'express';
import { pauseFood, resumeFood, getFoodCount } from "../controllers/foodController";    

const router = Router();

// Route to pause food service for a student
router.post('/pause', pauseFood);

// Route to resume food service for a student
router.post('/resume', resumeFood);

// Route to get food count for the warden
router.get('/food-count', getFoodCount);

export default router;
