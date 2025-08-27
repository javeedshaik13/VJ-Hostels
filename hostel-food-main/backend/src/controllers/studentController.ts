import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';
import { getDb } from '../models/db';

const GOOGLE_CLIENT_ID = '522460567146-ubk3ojomopil8f68hl73jt1pj0jbbm68.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleOAuth = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing credential' });
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) return res.status(401).json({ error: 'No email in Google token' });
    const db = await getDb();
    const student = await db.get('SELECT id, roll_number FROM students WHERE email = ?', [email]);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ studentId: student.id, rollNumber: student.roll_number });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(401).json({ error: 'Invalid Google token', details: message });
  }
};

export const getStudentsByHostel = async (req: Request, res: Response) => {
  try {
    const { hostelId } = req.params;
    
    if (!hostelId) {
      return res.status(400).json({ error: 'Hostel ID is required' });
    }

    const db = await getDb();
    
    // Get students for the specified hostel with their pause status
    const students = await db.all(`
      SELECT 
        s.id,
        s.name,
        s.roll_number,
        s.email,
        s.hostel_id,
        s.year,
        s.degree,
        CASE 
          WHEN fp.id IS NOT NULL AND 
               fp.pause_from <= date('now') AND 
               (fp.resume_from IS NULL OR fp.resume_from > date('now'))
          THEN 'paused'
          ELSE 'active'
        END as status,
        fp.resume_from as pause_until,
        fp.pause_meals
      FROM students s
      LEFT JOIN food_pauses fp ON s.id = fp.student_id 
        AND fp.pause_from <= date('now') 
        AND (fp.resume_from IS NULL OR fp.resume_from > date('now'))
      WHERE s.hostel_id = ?
      ORDER BY s.name ASC
    `, [hostelId]);

    // Get hostel information
    const hostel = await db.get(`
      SELECT h.name as hostel_name, w.name as warden_name
      FROM hostels h
      LEFT JOIN wardens w ON h.warden_id = w.id
      WHERE h.id = ?
    `, [hostelId]);

    res.json({
      success: true,
      students,
      hostel: hostel || { hostel_name: 'Unknown Hostel', warden_name: 'Unknown Warden' },
      total: students.length,
      active: students.filter(s => s.status === 'active').length,
      paused: students.filter(s => s.status === 'paused').length
    });

  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};
