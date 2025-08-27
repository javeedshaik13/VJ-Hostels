-- schema.sql: SQLite schema for hostel food management

-- Table: hostels
CREATE TABLE IF NOT EXISTS hostels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    warden_id INTEGER,
    FOREIGN KEY (warden_id) REFERENCES wardens(id)
);

-- Table: wardens
CREATE TABLE IF NOT EXISTS wardens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Table: students
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    roll_number TEXT UNIQUE NOT NULL,
    hostel_id INTEGER NOT NULL,
    email TEXT UNIQUE NOT NULL,
    year TEXT,
    degree TEXT,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id)
);

-- Table: food_pauses
CREATE TABLE IF NOT EXISTS food_pauses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    pause_from DATE NOT NULL,
    pause_meals TEXT NOT NULL, -- e.g. 'breakfast,lunch'
    resume_from DATE,
    resume_meals TEXT,         -- e.g. 'lunch,snacks,dinner'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Table: admins
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Table: food_counts (optional, for reporting/caching)
CREATE TABLE IF NOT EXISTS food_counts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostel_id INTEGER NOT NULL,
    date DATE NOT NULL,
    breakfast_count INTEGER DEFAULT 0,
    lunch_count INTEGER DEFAULT 0,
    snacks_count INTEGER DEFAULT 0,
    dinner_count INTEGER DEFAULT 0,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id)
);

CREATE UNIQUE INDEX idx_food_counts_hostel_date ON food_counts(hostel_id, date);