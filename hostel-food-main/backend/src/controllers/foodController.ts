import { Request, Response } from 'express';
import { getDb } from '../models/db';

// POST /pause
export const pauseFood = async (req: Request, res: Response) => {
    try {
        const { studentId, pause_from, pause_meals, resume_from, resume_meals } = req.body;
        if (!studentId || !pause_from || !resume_from) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Time restriction: Students must make changes before 6 PM today for tomorrow's meals
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const currentHour = now.getHours();
        
        // If they're trying to pause tomorrow's meals and it's after 6 PM today
        if (pause_from === tomorrow && currentHour >= 18) {
            return res.status(400).json({ 
                error: 'Deadline passed: Changes for tomorrow must be made before 6:00 PM today',
                deadline: '6:00 PM',
                currentTime: now.toLocaleTimeString('en-US', { hour12: true })
            });
        }

        // If they're trying to pause today's meals and it's after 6 PM
        if (pause_from === today && currentHour >= 18) {
            return res.status(400).json({ 
                error: 'Too late: Cannot modify today\'s meals after 6:00 PM',
                deadline: '6:00 PM',
                currentTime: now.toLocaleTimeString('en-US', { hour12: true })
            });
        }

        const db = await getDb();
        // Check if a pause record exists for this student and is still editable (future date)
        const existing = await db.get(
            `SELECT id, pause_from FROM food_pauses WHERE student_id = ? ORDER BY id DESC LIMIT 1`,
            [studentId]
        );
        if (existing && existing.pause_from > today) {
            // Update both pause and resume fields
            await db.run(
                `UPDATE food_pauses SET pause_from = ?, pause_meals = ?, resume_from = ?, resume_meals = ? WHERE id = ?`,
                [pause_from, pause_meals, resume_from || null, resume_meals || null, existing.id]
            );
            res.status(200).json({ message: 'Food pause/resume updated successfully' });
        } else {
            // Insert new record
            await db.run(
                `INSERT INTO food_pauses (student_id, pause_from, pause_meals, resume_from, resume_meals) VALUES (?, ?, ?, ?, ?)`,
                [studentId, pause_from, pause_meals, resume_from || null, resume_meals || null]
            );
            res.status(200).json({ message: 'Food paused successfully' });
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: 'Failed to pause food', details: message });
    }
};

// POST /resume
export const resumeFood = async (req: Request, res: Response) => {
    try {
        const { studentId, resume_from, resume_meals } = req.body;
        if (!studentId || !resume_from || !resume_meals) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const db = await getDb();
        // Find the latest pause record for this student
        const pause = await db.get(
            `SELECT id FROM food_pauses WHERE student_id = ? ORDER BY id DESC LIMIT 1`,
            [studentId]
        );
        if (!pause) {
            return res.status(404).json({ error: 'No pause record found for this student' });
        }
        await db.run(
            `UPDATE food_pauses SET resume_from = ?, resume_meals = ? WHERE id = ?`,
            [resume_from, resume_meals, pause.id]
        );
        res.status(200).json({ message: 'Food resumed successfully' });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: 'Failed to resume food', details: message });
    }
};

// GET /food-count
export const getFoodCount = async (req: Request, res: Response) => {
    try {
        const { date, hostelId } = req.query;
        if (!date || !hostelId) {
            return res.status(400).json({ error: 'Missing date or hostelId' });
        }
        const db = await getDb();
        const counts = await db.get(
            `SELECT * FROM food_counts WHERE hostel_id = ? AND date = ?`,
            [hostelId, date]
        );
        res.status(200).json(counts || {});
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: 'Failed to get food count', details: message });
    }
};
