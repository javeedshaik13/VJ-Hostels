import { Request, Response } from 'express';
import { getDb } from '../models/db';

// POST /food-count/calculate
export const calculateAndUpdateFoodCount = async (req: Request, res: Response) => {
    try {
        const { date, hostelId } = req.body;
        if (!date || !hostelId) {
            return res.status(400).json({ error: 'Missing date or hostelId' });
        }
        const db = await getDb();
        // Get all students in the hostel
        const students = await db.all(
            `SELECT id FROM students WHERE hostel_id = ?`,
            [hostelId]
        );
        let breakfast = 0, lunch = 0, snacks = 0, dinner = 0;
        for (const student of students) {
            // Get the latest pause record for this student before or on the date
            const pause = await db.get(
                `SELECT * FROM food_pauses WHERE student_id = ? ORDER BY pause_from DESC LIMIT 1`,
                [student.id]
            );
            if (!pause || !pause.pause_from) {
                // No pause entry: all meals counted
                breakfast++;
                lunch++;
                snacks++;
                dinner++;
                continue;
            }
            const pauseDate = pause.pause_from;
            const resumeDate = pause.resume_from;
            const pausedMeals = (pause.pause_meals || '').split(',').map((m: string) => m.trim()).filter(Boolean);
            const resumedMeals = (pause.resume_meals || '').split(',').map((m: string) => m.trim()).filter(Boolean);

            if (date < pauseDate) {
                // Before pause: all meals counted
                breakfast++;
                lunch++;
                snacks++;
                dinner++;
            } else if (date === pauseDate) {
                // On last day (pause date): only selected meals counted (meals they will have before leaving)
                if (pausedMeals.includes('breakfast')) breakfast++;
                if (pausedMeals.includes('lunch')) lunch++;
                if (pausedMeals.includes('snacks')) snacks++;
                if (pausedMeals.includes('dinner')) dinner++;
            } else if (resumeDate && date > pauseDate && date < resumeDate) {
                // Between pause+1 and resume-1: no meals counted (away from hostel)
                // Do nothing
            } else if (resumeDate && date === resumeDate) {
                // On return day (resume date): only selected meals counted (meals they will have on first day back)
                if (resumedMeals.includes('breakfast')) breakfast++;
                if (resumedMeals.includes('lunch')) lunch++;
                if (resumedMeals.includes('snacks')) snacks++;
                if (resumedMeals.includes('dinner')) dinner++;
            } else if (resumeDate && date > resumeDate) {
                // After resume: all meals counted
                breakfast++;
                lunch++;
                snacks++;
                dinner++;
            } else if (!resumeDate && date > pauseDate) {
                // Paused indefinitely after pause date: no meals counted
                // Do nothing
            }
        }
        // Upsert into food_counts
        await db.run(
            `INSERT INTO food_counts (hostel_id, date, breakfast_count, lunch_count, snacks_count, dinner_count)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(hostel_id, date) DO UPDATE SET
                breakfast_count=excluded.breakfast_count,
                lunch_count=excluded.lunch_count,
                snacks_count=excluded.snacks_count,
                dinner_count=excluded.dinner_count`,
            [hostelId, date, breakfast, lunch, snacks, dinner]
        );
        res.status(200).json({ breakfast, lunch, snacks, dinner });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: 'Failed to calculate food count', details: message });
    }
};
