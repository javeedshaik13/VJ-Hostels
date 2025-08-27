import { Router } from 'express';
import { wardenLogin } from '../controllers/wardenController';

const router = Router();

router.post('/login', wardenLogin);

export default router;
