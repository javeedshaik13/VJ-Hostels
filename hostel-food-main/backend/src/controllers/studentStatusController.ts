import { Request, Response } from 'express';
import { getDb } from '../models/db';

export const getStudentStatus = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ error: 'Missing studentId' });
    const db = await getDb();
    // Get the latest pause record for this student
    const pause = await db.get(
      `SELECT pause_from, pause_meals, resume_from, resume_meals FROM food_pauses WHERE student_id = ? ORDER BY id DESC LIMIT 1`,
      [studentId]
    );
    if (!pause) {
      return res.json({ pause_from: '', pause_meals: '', resume_from: '', resume_meals: '' });
    }
    res.json(pause);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to get student status', details: message });
  }
};

export const deletePauseSchedule = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const db = await getDb();
    
    const result = await db.run(
      `DELETE FROM food_pauses WHERE student_id = ?`,
      [studentId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'No pause schedule found for this student' });
    }

    res.json({ message: 'Pause schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting pause schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPauseRecordsByHostel = async (req: Request, res: Response) => {
  try {
    const { hostelId } = req.params;
    
    if (!hostelId) {
      return res.status(400).json({ error: 'Hostel ID is required' });
    }

    const db = await getDb();
    
    // Get pause records for students in the specified hostel
    const pauseRecords = await db.all(`
      SELECT 
        fp.id,
        fp.student_id,
        s.name as student_name,
        s.roll_number,
        fp.pause_from,
        fp.pause_meals,
        fp.resume_from,
        fp.resume_meals,
        fp.created_at
      FROM food_pauses fp
      INNER JOIN students s ON fp.student_id = s.id
      WHERE s.hostel_id = ?
      ORDER BY fp.created_at DESC
    `, [hostelId]);

    res.json({
      success: true,
      pauseRecords,
      total: pauseRecords.length
    });

  } catch (err) {
    console.error('Error fetching pause records:', err);
    res.status(500).json({ error: 'Failed to fetch pause records' });
  }
};
