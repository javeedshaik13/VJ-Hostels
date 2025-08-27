import express from 'express';
import { googleOAuth, getStudentsByHostel } from '../controllers/studentController';
const router = express.Router();

router.post('/oauth', googleOAuth);
router.get('/hostel/:hostelId', getStudentsByHostel);

export default router;
