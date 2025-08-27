import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDb() {
    if (!db) {
        db = await open({
            filename: path.join(__dirname, '../../hostel_food.db'),
            driver: sqlite3.Database
        });
    }
    return db;
}
