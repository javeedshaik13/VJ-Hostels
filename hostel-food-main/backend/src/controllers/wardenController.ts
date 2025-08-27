import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { getDb } from '../models/db';



export const wardenLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });

  if (!username || !password) {
    console.log('Missing username or password');
    return res.status(400).json({ error: 'Username and password required.' });
  }

  try {
    const db = await getDb();
    console.log('Database connection established');

    // Get warden with their associated hostel information
    const warden = await db.get(
      `SELECT w.*, h.id as hostel_id, h.name as hostel_name 
       FROM wardens w 
       LEFT JOIN hostels h ON w.id = h.warden_id 
       WHERE w.username = ?`,
      [username]
    );

    if (!warden) {
      console.log(`No warden found for username: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    console.log('Warden found:', warden);

    // Plain text password comparison (ignoring bcrypt)
    if (password === warden.password_hash) {
      console.log(`Password match for user: ${username}`);
      const { password_hash, ...wardenInfo } = warden;
      return res.json({ success: true, warden: wardenInfo, token: 'dummy-token' });
    } else {
      console.log(`Password mismatch for user: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
};

export const wardenLoginUsingBcrypt = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });

  if (!username || !password) {
    console.log('Missing username or password');
    return res.status(400).json({ error: 'Username and password required.' });
  }

  try {
    const db = await getDb();
    console.log('Database connection established');

    // Get warden with their associated hostel information
    const warden = await db.get(
      `SELECT w.*, h.id as hostel_id, h.name as hostel_name 
       FROM wardens w 
       LEFT JOIN hostels h ON w.id = h.warden_id 
       WHERE w.username = ?`,
      [username]
    );

    if (!warden) {
      console.log(`No warden found for username: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    console.log(`Warden found:`, warden);

    // Here, bcrypt compares the entered password ('wardena') with the stored password hash
    const valid = await bcrypt.compare(password, warden.password_hash);
    console.log('Password match result:', valid);

    if (!valid) {
      console.log(`Password mismatch for user: ${username}`);
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const { password_hash, ...wardenInfo } = warden;
    console.log(`Login successful for user: ${username}`);
    return res.json({ success: true, warden: wardenInfo, token: 'dummy-token' });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
};
