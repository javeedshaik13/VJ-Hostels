import express from 'express';
import { getStudentStatus, deletePauseSchedule, getPauseRecordsByHostel } from '../controllers/studentStatusController';
const router = express.Router();

router.get('/status', getStudentStatus);
router.delete('/pause/:studentId', deletePauseSchedule);
router.get('/pause-records/hostel/:hostelId', getPauseRecordsByHostel);

export default router;
